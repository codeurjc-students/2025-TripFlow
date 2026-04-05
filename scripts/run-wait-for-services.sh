#!/bin/bash
set -e

# Config (can be overridden by env vars)
API_URL="${API_URL:-http://localhost:8080}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:80}"
HEALTH_URL="${HEALTH_URL:-$API_URL/api/health}"
RETRIES="${RETRIES:-15}"
INTERVAL="${INTERVAL:-4}"

wait_for() {
  local url="$1"
  local max="$2"
  local intv="$3"
  local i=1

  while [ "$i" -le "$max" ]; do
    # curl returns non-zero on network error; capture HTTP code (or empty on error)
    status="$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || true)"
    if [ "$status" = "200" ]; then
      echo "[+] Service ready: $url"
      return 0
    fi

    echo "[*] Waiting for $url... ($i/$max)"
    sleep "$intv"
    i=$((i + 1))
  done

  echo "[-] Service did not respond after $max attempts: $url"
  return 1
}

echo "[*] Waiting for services..."

if ! wait_for "$HEALTH_URL" "$RETRIES" "$INTERVAL"; then
  echo "[-] Backend health check failed."
  exit 1
fi

if ! wait_for "$FRONTEND_URL" "$RETRIES" "$INTERVAL"; then
  echo "[-] Frontend check failed."
  exit 1
fi

echo "[+] All services are ready!"
exit 0