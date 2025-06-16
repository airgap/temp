#!/bin/bash

# Script to fix existing dashboards that have the massive links list issue
# This regenerates all service dashboards with the corrected template

set -e

GRAFANA_URL="${1:-http://localhost:3002}"
GRAFANA_PASSWORD="${2:-prom-operator}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATOR_SCRIPT="$SCRIPT_DIR/generate-service-dashboard.sh"

echo "🔧 Fixing existing service dashboards..."
echo "This will regenerate all service dashboards with the corrected template"
echo ""

# Get all existing service dashboards
EXISTING_DASHBOARDS=$(curl -s -u "admin:$GRAFANA_PASSWORD" \
    "$GRAFANA_URL/api/search?tag=lyku&tag=service" | jq -r '.[].uid' | grep "lyku-service-" || true)

if [ -z "$EXISTING_DASHBOARDS" ]; then
    echo "❌ No service dashboards found to fix"
    echo "   Make sure you have service dashboards tagged with 'lyku' and 'service'"
    exit 1
fi

DASHBOARD_COUNT=$(echo "$EXISTING_DASHBOARDS" | wc -l)
echo "📊 Found $DASHBOARD_COUNT service dashboards to fix"
echo ""

FIXED_COUNT=0
FAILED_COUNT=0

for dashboard_uid in $EXISTING_DASHBOARDS; do
    # Extract service name from UID (format: lyku-service-{service-name})
    SERVICE_NAME=$(echo "$dashboard_uid" | sed 's/lyku-service-//')
    
    if [ -n "$SERVICE_NAME" ]; then
        echo "🔧 Fixing dashboard for: $SERVICE_NAME"
        if "$GENERATOR_SCRIPT" "$SERVICE_NAME" "$GRAFANA_URL" "$GRAFANA_PASSWORD" > /dev/null 2>&1; then
            echo "✅ Fixed: $SERVICE_NAME"
            ((FIXED_COUNT++))
        else
            echo "❌ Failed to fix: $SERVICE_NAME"
            ((FAILED_COUNT++))
        fi
    else
        echo "⚠️  Skipping invalid dashboard UID: $dashboard_uid"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo "🎉 Dashboard fix complete!"
echo "✅ Fixed: $FIXED_COUNT dashboards"
echo "❌ Failed: $FAILED_COUNT dashboards"
echo ""
echo "The massive links list issue should now be resolved."
echo "🔗 Check a dashboard to verify: $GRAFANA_URL/dashboards"