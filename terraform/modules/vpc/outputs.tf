output "network_id" {
  description = "The ID of the custom VPC"
  value       = google_compute_network.custom_vpc.id
}

output "network_name" {
  description = "The name of the custom VPC"
  value       = google_compute_network.custom_vpc.name
}

output "public_subnet_id" {
  description = "The ID of the public subnet"
  value       = google_compute_subnetwork.public_subnet.id
}

output "private_subnet_id" {
  description = "The ID of the private subnet"
  value       = google_compute_subnetwork.private_subnet.id
}

output "private_subnet_name" {
  description = "The name of the private subnet"
  value       = google_compute_subnetwork.private_subnet.name
}

output "private_vpc_connection" {
  description = "The private service connection peering identifier (used for Cloud SQL dependency)"
  value       = google_service_networking_connection.private_vpc_connection.id
}
