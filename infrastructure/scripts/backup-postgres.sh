#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# LeadMap AI — Automated PostgreSQL Backup Script
# ==============================================================================

BACKUP_DIR="${BACKUP_DIR:-/var/backups/leadmap}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="${DB_DATABASE:-leadmap_ai}"
DB_USER="${DB_USERNAME:-leadmap_user}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting backup of ${DB_NAME} from ${DB_HOST}:${DB_PORT}..."

PGPASSWORD="${DB_PASSWORD:-}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -F p | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Retention: Delete local backups older than 30 days
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +30 -delete
echo "[$(date)] Cleaned up local backups older than 30 days."
