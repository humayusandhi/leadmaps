#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# LeadMap AI — Docker Compose Configuration Validator
# ==============================================================================

COMPOSE_FILE="${1:-docker-compose.yml}"

echo "[$(date)] Validating ${COMPOSE_FILE}..."

if [ ! -f "${COMPOSE_FILE}" ]; then
    echo "Error: ${COMPOSE_FILE} does not exist."
    exit 1
fi

# 1. YAML Syntax Check via Python
python3 -c "import yaml; yaml.safe_load(open('${COMPOSE_FILE}'))"
echo "✓ YAML syntax is valid."

# 2. Assert Required Services
REQUIRED_SERVICES=("postgres" "redis" "api" "worker" "web")
for service in "${REQUIRED_SERVICES[@]}"; do
    python3 -c "
import yaml, sys
config = yaml.safe_load(open('${COMPOSE_FILE}'))
if '${service}' not in config.get('services', {}):
    print('Missing service: ${service}')
    sys.exit(1)
"
    echo "✓ Service '${service}' is defined."
done

# 3. Security Assertions: Private Port Bindings (127.0.0.1 only)
python3 -c "
import yaml, sys
config = yaml.safe_load(open('${COMPOSE_FILE}'))
services = config.get('services', {})

for db_service in ['postgres', 'redis']:
    ports = services.get(db_service, {}).get('ports', [])
    for p in ports:
        port_str = str(p)
        if not port_str.startswith('127.0.0.1:'):
            print(f'SECURITY VIOLATION: {db_service} port binding {port_str} is not restricted to 127.0.0.1!')
            sys.exit(1)
"
echo "✓ PostgreSQL and Redis ports are restricted strictly to 127.0.0.1."

# 4. Healthcheck Assertions
python3 -c "
import yaml, sys
config = yaml.safe_load(open('${COMPOSE_FILE}'))
for s in ['postgres', 'redis']:
    if 'healthcheck' not in config.get('services', {}).get(s, {}):
        print(f'Missing healthcheck on {s}')
        sys.exit(1)
"
echo "✓ Health checks configured for database and cache layers."

echo "=========================================================="
echo "Docker Compose validation passed successfully!"
echo "=========================================================="
