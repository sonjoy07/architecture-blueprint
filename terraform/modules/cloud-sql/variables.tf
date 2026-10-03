variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP primary region"
  type        = string
  default     = "us-central1"
}

variable "instance_name" {
  description = "Cloud SQL instance name"
  type        = string
  default     = "enterprise-copilot-db"
}

variable "database_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "POSTGRES_16"
}

variable "tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-custom-4-16384" # 4 vCPU, 16 GB RAM
}

variable "vpc_network_id" {
  description = "VPC Network ID for Private IP"
  type        = string
}

variable "private_vpc_connection_dependency" {
  description = "Dependency on the private VPC peering connection"
  type        = any
}

variable "database_name" {
  description = "Initial application database name"
  type        = string
  default     = "enterprise_copilot"
}

variable "db_user" {
  description = "Application database username"
  type        = string
  default     = "copilot_api_user"
}

variable "db_password" {
  description = "Application database password"
  type        = string
  sensitive   = true
}
