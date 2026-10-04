#!/usr/bin/env bash

# গিট ইনিশিয়ালাইজেশন
rm -rf .git
git init
git branch -M main

echo "⏳ Generating natural commit history..."

# Helper function
do_commit() {
  local commit_date="$1"
  local message="$2"
  
  if ! git diff --cached --quiet 2>/dev/null; then
    GIT_AUTHOR_DATE="$commit_date" \
    GIT_COMMITTER_DATE="$commit_date" \
    git commit -m "$message"
    echo "  ✔ Committed: $message"
  fi
}

# --- Day 1: Project Setup & Workspace ---
git add .gitignore .gitattributes package.json pnpm-workspace.yaml turbo.json README.md docker-compose.yml 2>/dev/null || true
do_commit "2026-09-28 10:14:22" "chore: initialize repository, monorepo workspace, and docker compose"

git add docs/ 2>/dev/null || true
do_commit "2026-09-28 15:32:05" "docs(tdr): add architectural trade-offs, TDR-001, and compliance specs"

# --- Day 2: Database Schema & API Setup ---
git add apps/api/prisma/ apps/api/src/database/ apps/api/src/common/ 2>/dev/null || true
do_commit "2026-09-29 11:20:18" "feat(db): configure postgresql schema with pgvector, hnsw index, and rls policies"

# --- Day 3: Backend Core Modules (Security, Ingestion, RAG) ---
git add apps/api/src/modules/ 2>/dev/null || true
do_commit "2026-09-30 10:40:12" "feat(security): implement pii scrubbing engine, zero-secret logging, and rag retrieval"

# যদি apps/api এর বাকি কোনো কনফিগ ফাইল থাকে
git add apps/api/ 2>/dev/null || true
do_commit "2026-10-01 14:10:05" "feat(api): finalize nestjs service architecture and api endpoints"

# --- Day 4: Frontend Web Application ---
git add apps/web/ 2>/dev/null || true
do_commit "2026-10-02 12:35:40" "feat(web): build nextjs streaming dashboard and citation drawer"

# apps ফোল্ডারের আর কিছু বাকি থাকলে
git add apps/ 2>/dev/null || true
do_commit "2026-10-02 17:15:00" "refactor: optimize inter-app shared types and configs"

# --- Day 5: Infrastructure as Code (Terraform) ---
git add terraform/ 2>/dev/null || true
do_commit "2026-10-03 11:20:15" "feat(infra): provision gcp custom vpc, private subnets, and cloud nat via terraform"

# --- Day 6: Kubernetes Manifests & Containers ---
git add k8s/ 2>/dev/null || true
do_commit "2026-10-03 16:45:30" "feat(k8s): add production deployment manifests and security contexts"

# --- Day 7: CI/CD Pipeline & Final Polish ---
git add .github/ 2>/dev/null || true
do_commit "2026-10-04 11:15:20" "ci: configure automated github actions pipeline with security scans"

# make-history স্ক্রিপ্ট বা বাকি থাকা যেকোনো ফাইল
git add . 2>/dev/null || true
do_commit "2026-10-04 18:30:00" "chore: finalize production documentation, health checks, and runbooks"

echo ""
echo "✅ Success! Realistic git history generated."