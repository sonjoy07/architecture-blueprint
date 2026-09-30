variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP primary region"
  type        = string
  default     = "us-central1"
}

variable "network_name" {
  description = "Name of the custom VPC"
  type        = string
  default     = "enterprise-copilot-vpc"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet (Load Balancer / NAT)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR block for private subnet (GKE nodes and private services)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "pods_cidr" {
  description = "Secondary CIDR range for GKE Pods"
  type        = string
  default     = "10.4.0.0/14"
}

variable "services_cidr" {
  description = "Secondary CIDR range for GKE Services"
  type        = string
  default     = "10.8.0.0/20"
}
