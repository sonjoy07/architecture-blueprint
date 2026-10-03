terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.35"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Production remote state stored in CMEK-encrypted GCS bucket
  # backend "gcs" {
  #   bucket = "enterprise-copilot-tf-state-prod"
  #   prefix = "environments/prod"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# -----------------------------------------------------------------------------
# Generate Cryptographically Secure DB Password
# -----------------------------------------------------------------------------
resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# -----------------------------------------------------------------------------
# 1. VPC Networking Module
# -----------------------------------------------------------------------------
module "vpc" {
  source = "../../modules/vpc"

  project_id          = var.project_id
  region              = var.region
  network_name        = var.network_name
  public_subnet_cidr  = var.public_subnet_cidr
  private_subnet_cidr = var.private_subnet_cidr
}

# -----------------------------------------------------------------------------
# 2. Cloud SQL PostgreSQL Module with pgvector
# -----------------------------------------------------------------------------
module "cloud_sql" {
  source = "../../modules/cloud-sql"

  project_id                        = var.project_id
  region                            = var.region
  instance_name                     = "copilot-prod-pg"
  database_version                  = "POSTGRES_16"
  tier                              = var.db_tier
  vpc_network_id                    = module.vpc.network_id
  private_vpc_connection_dependency = module.vpc.private_vpc_connection
  database_name                     = var.db_name
  db_user                           = var.db_user
  db_password                       = random_password.db_password.result
}

# -----------------------------------------------------------------------------
# 3. Secret Manager Security Module
# -----------------------------------------------------------------------------
module "secrets" {
  source = "../../modules/secrets"

  project_id        = var.project_id
  environment       = "prod"
  database_password = random_password.db_password.result
  database_url      = "postgresql://${var.db_user}:${random_password.db_password.result}@${module.cloud_sql.private_ip_address}:5432/${var.db_name}?sslmode=require"
  openai_api_key    = var.openai_api_key
  anthropic_api_key = var.anthropic_api_key
}
