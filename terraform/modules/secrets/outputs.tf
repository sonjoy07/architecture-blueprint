output "db_password_secret_id" {
  description = "Secret ID for the database password"
  value       = google_secret_manager_secret.db_password_secret.id
}

output "db_url_secret_id" {
  description = "Secret ID for the full database connection string"
  value       = google_secret_manager_secret.db_url_secret.id
}

output "openai_key_secret_id" {
  description = "Secret ID for the OpenAI API key"
  value       = google_secret_manager_secret.openai_key_secret.id
}

output "anthropic_key_secret_id" {
  description = "Secret ID for the Anthropic API key"
  value       = google_secret_manager_secret.anthropic_key_secret.id
}
