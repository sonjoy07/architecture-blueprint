# -----------------------------------------------------------------------------
# Custom VPC Network (auto_create_subnetworks = false)
# -----------------------------------------------------------------------------
resource "google_compute_network" "custom_vpc" {
  name                    = var.network_name
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  project                 = var.project_id
}

# -----------------------------------------------------------------------------
# Subnets: Strict CIDR Allocation
# -----------------------------------------------------------------------------

# 1. Public Subnet (Load Balancer / Ingress / NAT Gateway)
resource "google_compute_subnetwork" "public_subnet" {
  name                     = "${var.network_name}-public-subnet"
  ip_cidr_range            = var.public_subnet_cidr
  region                   = var.region
  network                  = google_compute_network.custom_vpc.id
  private_ip_google_access = true
  project                  = var.project_id

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# 2. Private Subnet (Cloud SQL, Private GKE Nodes)
resource "google_compute_subnetwork" "private_subnet" {
  name                     = "${var.network_name}-private-subnet"
  ip_cidr_range            = var.private_subnet_cidr
  region                   = var.region
  network                  = google_compute_network.custom_vpc.id
  private_ip_google_access = true
  project                  = var.project_id

  secondary_ip_range {
    range_name    = "gke-pods-range"
    ip_cidr_range = var.pods_cidr
  }

  secondary_ip_range {
    range_name    = "gke-services-range"
    ip_cidr_range = var.services_cidr
  }

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# -----------------------------------------------------------------------------
# Cloud Router and Cloud NAT for Private Outbound Egress
# -----------------------------------------------------------------------------
resource "google_compute_router" "nat_router" {
  name    = "${var.network_name}-nat-router"
  region  = var.region
  network = google_compute_network.custom_vpc.id
  project = var.project_id
}

resource "google_compute_router_nat" "cloud_nat" {
  name                               = "${var.network_name}-cloud-nat"
  router                             = google_compute_router.nat_router.name
  region                             = var.region
  project                            = var.project_id
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# -----------------------------------------------------------------------------
# Private Services Access (VPC Peering for Cloud SQL Private IP)
# -----------------------------------------------------------------------------
resource "google_compute_global_address" "private_ip_alloc" {
  name          = "${var.network_name}-private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.custom_vpc.id
  project       = var.project_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.custom_vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]
}

# -----------------------------------------------------------------------------
# Zero-Trust Firewall Rules
# -----------------------------------------------------------------------------

# Allow Ingress from Google Health Checks to Public Ingress
resource "google_compute_firewall" "allow_health_checks" {
  name    = "${var.network_name}-allow-health-checks"
  network = google_compute_network.custom_vpc.id
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "3000", "8080"]
  }

  source_ranges = ["130.211.0.0/22", "35.191.0.0/16"]
  target_tags   = ["gke-node", "ingress-target"]
}

# Allow Internal Communication strictly within RFC 1918 VPC Ranges
resource "google_compute_firewall" "allow_internal_vpc" {
  name    = "${var.network_name}-allow-internal-vpc"
  network = google_compute_network.custom_vpc.id
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "icmp"
  }

  source_ranges = [var.public_subnet_cidr, var.private_subnet_cidr, var.pods_cidr, var.services_cidr]
}

# Explicit Deny: Block any external traffic to PostgreSQL Database Port 5432
resource "google_compute_firewall" "deny_external_database" {
  name        = "${var.network_name}-deny-external-database"
  network     = google_compute_network.custom_vpc.id
  project     = var.project_id
  priority    = 900
  direction   = "INGRESS"

  deny {
    protocol = "tcp"
    ports    = ["5432"]
  }

  source_ranges = ["0.0.0.0/0"]
}
