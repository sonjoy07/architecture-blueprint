variable "project_id" {
  description = "The GCP Project ID where production resources will be created"
  type        = string
}

variable "region" {
  description = "The GCP primary region for production deployment"
  type        = string
  default     = "us-central1"
}

variable "network_name" {
  description = "Name of the production VPC"
  type        = string
  default     = "copilot-prod-vpc"
}

variable "public_subnet_cidr" {
  description = "Public subnet CIDR block for load balancing and NAT"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "Private subnet CIDR block for GKE and internal services"
  type        = string
  default     = "10.0.2.0/24"
}

variable "db_tier" {
  description = "Cloud SQL machine tier for production"
  type        = string
  default     = "db-custom-8-32768" # 8 vCPU, 32 GB RAM
}

variable "db_name" {
  description = "Name of the production database"
  type        = string
  default     = "enterprise_copilot_prod"
}

variable "db_user" {
  description = "Database user for API application"
  type        = string
  default     = "copilot_prod_user"
}

variable "openai_api_key" {
  description = "Production OpenAI API Key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "anthropic_api_key" {
  description = "Production Anthropic API Key"
  type        = string
  sensitive   = true
  default     = ""
}
