#!/usr/bin/env bash
# ==============================================================================
# LeadMap AI — One-Click Deployment Script for Hostinger
# ==============================================================================
set -e

# Default configurations (can be overridden in .env.deploy or environment variables)
DEPLOY_ENV_FILE=".env.deploy"
if [ -f "$DEPLOY_ENV_FILE" ]; then
  # shellcheck source=/dev/null
  source "$DEPLOY_ENV_FILE"
fi

HOSTINGER_USER="${HOSTINGER_USER:-u888533767}"
HOSTINGER_HOST="${HOSTINGER_HOST:-leadmaps.in}"
HOSTINGER_PORT="${HOSTINGER_PORT:-65002}"
REMOTE_WEB_DIR="${REMOTE_WEB_DIR:-/home/u888533767/domains/leadmaps.in/public_html/apps/web}"
PM2_APP_NAME="${PM2_APP_NAME:-leadmaps}"

echo "=============================================================================="
echo "🚀 LeadMap AI — One-Click Hostinger Deployment"
echo "Target: ${HOSTINGER_USER}@${HOSTINGER_HOST}:${HOSTINGER_PORT}"
echo "Remote Directory: ${REMOTE_WEB_DIR}"
echo "=============================================================================="

# 1. Build locally (bypasses Hostinger CPU/thread resource limits)
echo "📦 Step 1: Building project locally..."
npm run build:types
npm run build:web

# 2. Package production bundle
echo "📦 Step 2: Packaging Next.js build artifacts..."
BUNDLE_NAME="leadmaps-deploy.tar.gz"
cd apps/web

tar --exclude='.next/cache' -czf "../../${BUNDLE_NAME}" \
  .next \
  public \
  server.js \
  package.json \
  next.config.ts

cd ../..

echo "✓ Bundle created (${BUNDLE_NAME})"

# 3. Upload to Hostinger server
echo "📤 Step 3: Uploading bundle to Hostinger via SCP..."
scp -P "${HOSTINGER_PORT}" "${BUNDLE_NAME}" "${HOSTINGER_USER}@${HOSTINGER_HOST}:${REMOTE_WEB_DIR}/${BUNDLE_NAME}"

# Clean up local archive
rm -f "${BUNDLE_NAME}"

# 4. Extract and restart PM2 on the server
echo "🔄 Step 4: Extracting build and restarting PM2 process on server..."
ssh -p "${HOSTINGER_PORT}" "${HOSTINGER_USER}@${HOSTINGER_HOST}" "bash -s" << REMOTE_SCRIPT
  set -e
  cd "${REMOTE_WEB_DIR}"

  echo "-> Extracting bundle..."
  tar -xzf "${BUNDLE_NAME}"
  rm -f "${BUNDLE_NAME}"

  # Ensure NVM / Node / PM2 is in PATH
  export NVM_DIR="\$HOME/.nvm"
  [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

  echo "-> Reloading application with PM2..."
  if command -v pm2 >/dev/null 2>&1; then
    pm2 restart "${PM2_APP_NAME}" || pm2 start server.js --name "${PM2_APP_NAME}"
    pm2 save
  else
    echo "PM2 not found globally, checking local or starting server..."
    npx pm2 restart "${PM2_APP_NAME}" || npx pm2 start server.js --name "${PM2_APP_NAME}"
  fi

  echo "-> Health check:"
  sleep 2
  curl -I http://127.0.0.1:3000 || true
REMOTE_SCRIPT

echo "=============================================================================="
echo "🎉 DEPLOYMENT COMPLETE! App is live at https://${HOSTINGER_HOST}"
echo "=============================================================================="
