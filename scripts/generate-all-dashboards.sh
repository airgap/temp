#!/bin/bash

# Script to generate dashboards for all Lyku services currently deployed
# Usage: ./generate-all-dashboards.sh [grafana-url] [admin-password]

set -e

GRAFANA_URL="${1:-http://localhost:3002}"
GRAFANA_PASSWORD="${2:-prom-operator}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATOR_SCRIPT="$SCRIPT_DIR/generate-service-dashboard.sh"

if [ ! -f "$GENERATOR_SCRIPT" ]; then
    echo "Error: Generator script not found at $GENERATOR_SCRIPT"
    exit 1
fi

echo "🔍 Discovering Lyku services..."

# Get all unique service names from Prometheus
SERVICES=$(curl -s -u "admin:$GRAFANA_PASSWORD" \
    "$GRAFANA_URL/api/datasources/proxy/uid/prometheus/api/v1/query?query=group%20by%20(exported_service)%20(lyku_requests_total)" \
    | jq -r '.data.result[].metric.exported_service' \
    | grep -v "null" \
    | sort -u)

if [ -z "$SERVICES" ]; then
    echo "❌ No services found with metrics. Make sure services are deployed and reporting metrics."
    exit 1
fi

SERVICE_COUNT=$(echo "$SERVICES" | wc -l)
echo "📊 Found $SERVICE_COUNT services with metrics:"
echo "$SERVICES" | sed 's/^/  • /'
echo ""

CREATED_COUNT=0
FAILED_COUNT=0

for service in $SERVICES; do
    echo "🚀 Creating dashboard for: $service"
    if "$GENERATOR_SCRIPT" "$service" "$GRAFANA_URL" "$GRAFANA_PASSWORD"; then
        ((CREATED_COUNT++))
    else
        ((FAILED_COUNT++))
        echo "⚠️  Failed to create dashboard for $service"
    fi
    echo ""
done

echo "📈 Dashboard generation complete!"
echo "✅ Created: $CREATED_COUNT dashboards"
echo "❌ Failed: $FAILED_COUNT dashboards"
echo ""
echo "🔗 Access dashboards at: $GRAFANA_URL/dashboards"
echo "🏠 Main overview: $GRAFANA_URL/d/lyku-services-v3/lyku-services-overview-clean"