#!/bin/bash
set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[+] Generating backend coverage with JaCoCo..."

# Define backend report directory
REPORT_DIR="$PROJECT_ROOT/docs/coverage/backend"
mkdir -p "$REPORT_DIR"

# Clean previous reports
echo "[+] Cleaning previous reports..."
rm -rf "$PROJECT_ROOT/backend/api-service/target/site/jacoco"
rm -rf "$REPORT_DIR"/*

# Run tests and generate coverage report
echo "[+] Running backend tests and generating coverage..."
cd "$PROJECT_ROOT/backend"

./mvnw clean test -pl ai-service -am
./mvnw clean test -pl notification-service -am
./mvnw clean verify -pl api-service -am

# Move reports to the designated report directory
echo "[+] Moving reports to $REPORT_DIR..."
cp -r api-service/target/site/jacoco/* "$REPORT_DIR/"

echo "[+] Backend coverage generated successfully!"
echo "[+] Report location: $REPORT_DIR/index.html"

cd "$SCRIPT_DIR"
