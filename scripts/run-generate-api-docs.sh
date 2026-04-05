#!/bin/bash
set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[+] Starting TripFlow API Docs generation..."

API_URL="http://localhost:8080"

# Wake up services with Docker Compose
echo "[+] Starting Docker Compose services..."
cd "$PROJECT_ROOT"
docker compose --env-file docker/.env.example -f docker/docker-compose.test.yaml up -d

# Wait for services to be healthy
echo "[+] Waiting for services to be healthy..."
"$SCRIPT_DIR/run-wait-for-services.sh"

# Ensure docs/api directory exists
if [ ! -d "$PROJECT_ROOT/docs/api" ]; then
  echo "[+] Creating docs/api directory..."
  mkdir -p "$PROJECT_ROOT/docs/api"
fi

# Install Redocly CLI
echo "[+] Installing Redocly CLI..."
if ! npx @redocly/cli --version >/dev/null 2>&1; then
  echo "[!] Unable to execute Redocly CLI via npx"
  exit 1
fi

# Download OpenAPI specification from the running API
echo "[+] Downloading OpenAPI specification..."
DOCS_TARGET="$PROJECT_ROOT/docs/api/api-docs.yaml"

if ! curl --fail --location --silent --show-error \
  -o "$DOCS_TARGET" \
  "$API_URL/v3/api-docs.yaml"; then
  echo "[!] YAML endpoint unavailable, falling back to JSON endpoint..."
  curl --fail --location --silent --show-error \
    -o "$DOCS_TARGET" \
    "$API_URL/v3/api-docs"
fi

# Generate API documentation using Redocly
echo "[+] Generating API documentation..."
npx @redocly/cli build-docs "$PROJECT_ROOT/docs/api/api-docs.yaml" --output "$PROJECT_ROOT/docs/api/api-docs.html"

# Stop and remove test containers
echo "[+] Stopping and removing test containers..."
cd "$PROJECT_ROOT"
docker compose -f docker/docker-compose.test.yaml down

echo "[+] API Docs generation finished!"
cd "$SCRIPT_DIR"
