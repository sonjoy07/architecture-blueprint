# -----------------------------------------------------------------------------
# Cloud SQL PostgreSQL 16+ with pgvector & Zero Public IP
# -----------------------------------------------------------------------------
resource "random_id" "db_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "postgres" {
  name             = "${var.instance_name}-${random_id.db_suffix.hex}"
  database_version = var.database_version
  region           = var.region
  project          = var.project_id

  depends_on = [var.private_vpc_connection_dependency]

  settings {
    tier              = var.tier
    availability_type = "REGIONAL" # High Availability cross-zone failover
    disk_type         = "PD_SSD"
    disk_size         = 100
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled                                  = false # Zero Public IP
      private_network                               = var.vpc_network_id
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "02:00"
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    # Enterprise Database Flags (pgvector, Performance, & Security)
    database_flags {
      name  = "cloudsql.enable_pgvector"
      value = "on"
    }

    database_flags {
      name  = "work_mem"
      value = "65536" # 64MB work memory for in-memory HNSW vector calculations
    }

    database_flags {
      name  = "maintenance_work_mem"
      value = "2097152" # 2GB maintenance work mem for fast HNSW index builds
    }

    database_flags {
      name  = "log_connections"
      value = "on"
    }

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "500" # Log queries taking longer than 500ms
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }

  deletion_protection = true
}

# -----------------------------------------------------------------------------
# Database and Application User
# -----------------------------------------------------------------------------
resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.postgres.name
  project  = var.project_id
}

resource "google_sql_user" "app_user" {
  name     = var.db_user
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
  project  = var.project_id
}
