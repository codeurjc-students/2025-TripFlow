#!/bin/bash
set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[+] Starting TripFlow E2E environment..."

# Check if AI_API_KEY is provided as argument
if [ -n "$1" ]; then
    export AI_API_KEY="$1"
    echo "[+] Using AI_API_KEY from argument"
elif [ -n "$AI_API_KEY" ]; then
    echo "[+] Using AI_API_KEY from environment"
else
    echo "[WARNING] AI_API_KEY not provided. AI features may not work."
    echo "[INFO] Usage: ./run-e2e-test.sh [AI_API_KEY]"
fi

# Select environment file
if [ -f "docker/.env" ]; then
    ENV_FILE="docker/.env"
else
    ENV_FILE="docker/.env.example"
fi
echo "[+] Using environment file: $ENV_FILE"

export API_URL="http://localhost:8080"
export FRONTEND_URL="http://localhost"

# Wake up services with Docker Compose
echo "[+] Starting Docker Compose services..."
cd "$PROJECT_ROOT"
docker compose --env-file "$ENV_FILE" -f docker/docker-compose.test.yaml up -d

# Install E2E dependencies
echo "[+] Installing E2E dependencies..."
cd "$PROJECT_ROOT/e2e"
npm ci

# Install Playwright browsers
echo "[+] Installing Playwright browsers..."
npx playwright install

# Wait for services to be healthy
echo "[+] Waiting for services to be healthy..."
if [ -x "$SCRIPT_DIR/run-wait-for-services.sh" ]; then
  "$SCRIPT_DIR/run-wait-for-services.sh"
else
  echo "[-] Wait script not found or not executable: $SCRIPT_DIR/run-wait-for-services.sh"
  exit 1
fi

# Run tests
echo "[+] Running E2E tests..."
npx playwright test

# Stop and remove test containers
echo "[+] Stopping and removing test containers..."
cd "$PROJECT_ROOT"
docker compose --env-file "$ENV_FILE" -f docker/docker-compose.test.yaml down

echo "[+] E2E pipeline finished!"

cd "$SCRIPT_DIR"
