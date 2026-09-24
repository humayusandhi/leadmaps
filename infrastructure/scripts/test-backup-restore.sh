#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# LeadMap AI — Backup & Restore Automated Verification Test
# Tests: End-to-end dump, GPG encryption, SHA-256 verification, and dry restore.
# ==============================================================================

TEST_DIR=$(mktemp -d "${TMPDIR:-/tmp}/leadmap_backup_test_XXXXXX")
trap 'rm -rf "${TEST_DIR}"' EXIT

export BACKUP_DIR="${TEST_DIR}"
export GPG_PASSPHRASE="test_leadmap_secret_passphrase_123"
export DB_DATABASE="leadmap_test"
export DB_USERNAME="leadmap_test_user"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Testing Hardened Database Backup Pipeline ==="

# 1. Execute Backup
BACKUP_PATH=$(bash "${SCRIPT_DIR}/backup-postgres.sh" | tail -n 1)

if [ ! -f "${BACKUP_PATH}" ]; then
    echo "FAIL: Backup file not generated at ${BACKUP_PATH}" >&2
    exit 1
fi
echo "✓ Backup file created: ${BACKUP_PATH}"

# 2. Verify Checksum File
CHECKSUM_FILE="${BACKUP_PATH}.sha256"
if [ ! -f "${CHECKSUM_FILE}" ]; then
    echo "FAIL: SHA-256 checksum file not found: ${CHECKSUM_FILE}" >&2
    exit 1
fi
echo "✓ Checksum file verified: $(cat "${CHECKSUM_FILE}")"

# 3. Test Dry-Run Restore with Checksum Validation
echo "=== Testing Dry-Run Restore & Integrity Verification ==="
bash "${SCRIPT_DIR}/restore-postgres.sh" "${BACKUP_PATH}" --dry-run
echo "✓ Dry-run restore check passed."

# 4. Test Automated Restore with Force Flag
echo "=== Testing Automated Restore Lifecycle ==="
bash "${SCRIPT_DIR}/restore-postgres.sh" "${BACKUP_PATH}" --force
echo "✓ Automated restore check passed."

echo "=== All Backup & Restore Verification Tests PASSED (100%) ==="
