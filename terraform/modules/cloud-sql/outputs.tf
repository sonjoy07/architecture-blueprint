output "instance_name" {
  description = "The name of the database instance"
  value       = google_sql_database_instance.postgres.name
}

output "instance_connection_name" {
  description = "The connection name of the instance for Cloud SQL Auth Proxy"
  value       = google_sql_database_instance.postgres.connection_name
}

output "private_ip_address" {
  description = "The private IPv4 address assigned for the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "database_name" {
  description = "The name of the default database"
  value       = google_sql_database.database.name
}

output "db_user" {
  description = "The application database username"
  value       = google_sql_user.app_user.name
}
