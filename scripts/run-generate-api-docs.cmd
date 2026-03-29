@echo off
SETLOCAL

REM Get the script directory and project root
SET SCRIPT_DIR=%~dp0
SET PROJECT_ROOT=%SCRIPT_DIR%..

echo [+] Starting TripFlow API Docs generation...

set API_URL=http://localhost:8080

REM Wake up services with Docker Compose
echo [+] Starting Docker Compose services...
cd /d "%PROJECT_ROOT%"
call docker compose --env-file docker\.env.example -f docker\docker-compose.test.yaml up -d

REM Wait for services to be healthy
echo [+] Waiting for services to be healthy...
call "%SCRIPT_DIR%run-wait-for-services.cmd"

REM Ensure docs\api directory exists
if not exist "%PROJECT_ROOT%\docs\api" (
  echo [+] Creating docs\api directory...
  mkdir "%PROJECT_ROOT%\docs\api"
)

REM Install Redocly CLI
echo [+] Installing Redocly CLI...
call npm install @redocly/cli -g

REM Download OpenAPI specification from the running API
echo [+] Downloading OpenAPI specification...
set DOCS_TARGET=%PROJECT_ROOT%\docs\api\api-docs.yaml
call curl --fail --location --silent --show-error -o "%DOCS_TARGET%" "%API_URL%/v3/api-docs.yaml"
if errorlevel 1 (
  echo [!] YAML endpoint unavailable, falling back to JSON endpoint...
  call curl --fail --location --silent --show-error -o "%DOCS_TARGET%" "%API_URL%/v3/api-docs"
  if errorlevel 1 (
    echo [-] Failed to download OpenAPI specification from both YAML and JSON endpoints.
    goto cleanup
  )
)

REM Generate API documentation using Redocly
echo [+] Generating API documentation...
call redocly build-docs "%DOCS_TARGET%" --output "%PROJECT_ROOT%\docs\api\api-docs.html"
if errorlevel 1 (
  echo [-] Failed to generate API documentation with Redocly.
  goto cleanup
)

REM Stop and remove test containers
:cleanup
echo [+] Stopping and removing test containers...
cd /d "%PROJECT_ROOT%"
call docker compose --env-file docker\.env.example -f docker\docker-compose.test.yaml down

echo [+] API Docs generation finished!
cd /d "%SCRIPT_DIR%"
ENDLOCAL
