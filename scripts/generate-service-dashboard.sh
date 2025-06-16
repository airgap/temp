#!/bin/bash

# Script to auto-generate Grafana dashboards for Lyku services
# Usage: ./generate-service-dashboard.sh <service-name> [grafana-url] [admin-password]

set -e

SERVICE_NAME="$1"
GRAFANA_URL="${2:-http://localhost:3002}"
GRAFANA_PASSWORD="${3:-prom-operator}"

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [grafana-url] [admin-password]"
    echo "Example: $0 list-hot-posts"
    exit 1
fi

# Convert service name to title case
SERVICE_TITLE=$(echo "$SERVICE_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/../k8s/service-dashboard-template.json"

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Error: Template file not found at $TEMPLATE_FILE"
    exit 1
fi

# Create temporary file with service-specific dashboard
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Replace placeholders in template
sed "s/{{SERVICE_NAME}}/$SERVICE_NAME/g; s/{{SERVICE_TITLE}}/$SERVICE_TITLE/g" "$TEMPLATE_FILE" > "$TEMP_FILE"

echo "Generating dashboard for service: $SERVICE_NAME"
echo "Service title: $SERVICE_TITLE"

# Import dashboard to Grafana
RESPONSE=$(curl -s -X POST \
    -u "admin:$GRAFANA_PASSWORD" \
    -H "Content-Type: application/json" \
    -d @"$TEMP_FILE" \
    "$GRAFANA_URL/api/dashboards/db")

# Check if import was successful
if echo "$RESPONSE" | jq -e '.status == "success"' > /dev/null 2>&1; then
    DASHBOARD_URL=$(echo "$RESPONSE" | jq -r '.url')
    DASHBOARD_ID=$(echo "$RESPONSE" | jq -r '.id')
    echo "✅ Dashboard created successfully!"
    echo "📊 Dashboard ID: $DASHBOARD_ID"
    echo "🔗 Dashboard URL: $GRAFANA_URL$DASHBOARD_URL"
    echo ""
    echo "Dashboard includes:"
    echo "  • Service uptime/health status"
    echo "  • Request duration monitoring"
    echo "  • Error rate tracking"
    echo "  • Memory usage"
    echo "  • Request rate over time"
    echo "  • Health check monitoring"
else
    echo "❌ Failed to create dashboard"
    echo "Response: $RESPONSE"
    exit 1
fi