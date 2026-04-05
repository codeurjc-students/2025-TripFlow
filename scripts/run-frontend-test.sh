#!/bin/bash
set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[+] Generating frontend coverage with Vitest..."

# Define frontend report directory
REPORT_DIR="$PROJECT_ROOT/docs/coverage/frontend"

# Create report directory if it doesn't exist
mkdir -p "$REPORT_DIR"

# Clean previous reports
echo "[+] Cleaning previous reports..."
rm -rf "$PROJECT_ROOT/frontend/coverage"
rm -rf "$REPORT_DIR"/*

# Run tests and generate coverage report
echo "[+] Running frontend tests and generating coverage..."
cd "$PROJECT_ROOT/frontend"
npm run test -- --coverage

# Move reports to the designated report directory
echo "[+] Moving reports to $REPORT_DIR..."
cp -r coverage/* "$REPORT_DIR/"

echo "[+] Frontend coverage generated successfully!"
echo "[+] Report location: $REPORT_DIR/index.html"

cd "$SCRIPT_DIR"