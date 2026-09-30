# Enterprise GCP Terraform Infrastructure Runbook

## Overview
This directory contains production-ready, modular Terraform configurations for the **Multi-Tenant Enterprise Document & Policy Knowledge Copilot** on Google Cloud Platform (GCP).

### Modules
- **`modules/vpc`**: Custom VPC (`auto_create_subnetworks = false`), public and private subnets, Cloud Router + Cloud NAT, Private Services Access peering for Cloud SQL, and zero-trust firewall rules.
- **`modules/cloud-sql`**: PostgreSQL 16+ instance configured with private IP only, High Availability (REGIONAL), automated point-in-time recovery (PITR), and `cloudsql.enable_pgvector = "on"`.
- **`modules/secrets`**: GCP Secret Manager secrets for the database password, generated database URL, and LLM API keys.

---

## Prerequisites

1. **Google Cloud SDK (`gcloud` CLI):**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   gcloud config set project <YOUR_PROJECT_ID>
   ```

2. **Required GCP API Services:**
   Ensure the following APIs are activated:
   ```bash
   gcloud services enable \
     compute.googleapis.com \
     servicenetworking.googleapis.com \
     sqladmin.googleapis.com \
     secretmanager.googleapis.com \
     container.googleapis.com
   ```

3. **Required IAM Permissions:**
   The provisioning identity requires the following minimum roles:
   - `roles/compute.networkAdmin`
   - `roles/cloudsql.admin`
   - `roles/secretmanager.admin`
   - `roles/resourcemanager.projectIamAdmin`

---

## Execution Guide

### Step 1: Initialize Working Directory
Navigate to the production environment:
```bash
cd terraform/environments/prod
```

Initialize provider plugins and backend state:
```bash
terraform init
```

### Step 2: Configure Environment Variables
Copy the template variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```
Edit `terraform.tfvars` with your enterprise project ID, region, and LLM API keys.

### Step 3: Run Validation & Security Linting
Format check and validate configurations:
```bash
terraform fmt -check
terraform validate
```

### Step 4: Generate Execution Plan
Run `terraform plan` and output a binary execution plan file (`tfplan`). This prevents concurrency drift between planning and applying:
```bash
terraform plan \
  -var-file="terraform.tfvars" \
  -out="tfplan"
```

Inspect the output to verify:
1. VPC network and subnets have explicit CIDR blocks (`10.0.1.0/24` and `10.0.2.0/24`).
2. Cloud SQL instance `ipv4_enabled` is strictly `false`.
3. Secret Manager secrets are securely staged without plaintext output in console logs.

### Step 5: Apply Infrastructure
Apply the verified plan file:
```bash
terraform apply "tfplan"
```

### Step 6: Post-Deployment Verification
Retrieve assigned private IP and secret endpoints:
```bash
terraform output
```

To view the generated connection string stored in Secret Manager:
```bash
gcloud secrets versions access latest --secret="copilot-prod-database-url"
```

---

## Destroy / Teardown (Sandbox Only)
To tear down all resources safely in a non-production test environment:
```bash
terraform destroy -var-file="terraform.tfvars"
```
*(Note: Cloud SQL instances feature `deletion_protection = true` by default to prevent accidental data loss. This must be set to `false` prior to running destroy).*
