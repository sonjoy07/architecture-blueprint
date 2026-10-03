output "vpc_network_name" {
  description = "The name of the production VPC"
  value       = module.vpc.network_name
}

output "public_subnet_id" {
  description = "Public subnet ID"
  value       = module.vpc.public_subnet_id
}

output "private_subnet_id" {
  description = "Private subnet ID"
  value       = module.vpc.private_subnet_id
}

output "cloud_sql_instance_name" {
  description = "Cloud SQL Instance Name"
  value       = module.cloud_sql.instance_name
}

output "cloud_sql_private_ip" {
  description = "Private IP address of the Cloud SQL PostgreSQL instance"
  value       = module.cloud_sql.private_ip_address
}

output "db_secret_url_id" {
  description = "Secret Manager ID for the database connection URL"
  value       = module.secrets.db_url_secret_id
}
