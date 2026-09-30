variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "environment" {
  description = "Environment identifier (e.g. prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "database_password" {
  description = "Database user password to store securely in Secret Manager"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Full connection string for Cloud SQL"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key for embeddings and RAG generation"
  type        = string
  sensitive   = true
  default     = ""
}

variable "anthropic_api_key" {
  description = "Anthropic API key for alternative RAG models"
  type        = string
  sensitive   = true
  default     = ""
}
