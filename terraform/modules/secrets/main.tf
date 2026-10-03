# -----------------------------------------------------------------------------
# GCP Secret Manager Secrets & Versions
# -----------------------------------------------------------------------------

# 1. Database Password Secret
resource "google_secret_manager_secret" "db_password_secret" {
  secret_id = "copilot-${var.environment}-db-password"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    app         = "enterprise-copilot"
    compliance  = "soc2-hipaa"
  }
}

resource "google_secret_manager_secret_version" "db_password_version" {
  secret      = google_secret_manager_secret.db_password_secret.id
  secret_data = var.database_password
}

# 2. Database Connection URL Secret
resource "google_secret_manager_secret" "db_url_secret" {
  secret_id = "copilot-${var.environment}-database-url"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    app         = "enterprise-copilot"
  }
}

resource "google_secret_manager_secret_version" "db_url_version" {
  secret      = google_secret_manager_secret.db_url_secret.id
  secret_data = var.database_url
}

# 3. OpenAI API Key Secret
resource "google_secret_manager_secret" "openai_key_secret" {
  secret_id = "copilot-${var.environment}-openai-api-key"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    app         = "enterprise-copilot"
  }
}

resource "google_secret_manager_secret_version" "openai_key_version" {
  count       = var.openai_api_key != "" ? 1 : 0
  secret      = google_secret_manager_secret.openai_key_secret.id
  secret_data = var.openai_api_key
}

# 4. Anthropic API Key Secret
resource "google_secret_manager_secret" "anthropic_key_secret" {
  secret_id = "copilot-${var.environment}-anthropic-api-key"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    app         = "enterprise-copilot"
  }
}

resource "google_secret_manager_secret_version" "anthropic_key_version" {
  count       = var.anthropic_api_key != "" ? 1 : 0
  secret      = google_secret_manager_secret.anthropic_key_secret.id
  secret_data = var.anthropic_api_key
}
