#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# LeadMap AI — Verified PostgreSQL Restore Script
# ==============================================================================

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${DB_DATABASE:-leadmap_ai}"
DB_USER="${DB_USERNAME:-leadmap_user}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "[$(date)] WARNING: Restoring will overwrite existing data in ${DB_NAME} on ${DB_HOST}:${DB_PORT}!"
read -r -p "Are you sure you want to proceed? [y/N] " confirmation
if [[ ! "${confirmation}" =~ ^[Yy]$ ]]; then
    echo "Restore aborted by user."
    exit 0
fi

echo "[$(date)] Starting restore from ${BACKUP_FILE}..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD:-}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"

echo "[$(date)] Database restore completed successfully."
