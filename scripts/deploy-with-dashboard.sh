#!/bin/bash

# Enhanced deployment script that automatically creates Grafana dashboards
# Usage: ./deploy-with-dashboard.sh <service-name> [additional-deploy-args...]

set -e

SERVICE_NAME="$1"
shift  # Remove service name from arguments, leaving any additional deploy args

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [additional-deploy-args...]"
    echo "Example: $0 list-hot-posts --force"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_GENERATOR="$SCRIPT_DIR/generate-service-dashboard.sh"

# Configuration (can be overridden by environment variables)
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3002}"
GRAFANA_PASSWORD="${GRAFANA_PASSWORD:-prom-operator}"

echo "🚀 Deploying service: $SERVICE_NAME"

# Here you would add your actual deployment logic
# For example, if you have a deploy script or use kubectl directly:
# 
# kubectl apply -f k8s/micro.yaml (with appropriate substitutions)
# or
# ./deploy-service.sh "$SERVICE_NAME" "$@"

echo "📦 Service deployment completed"

# Wait a moment for the service to start and begin reporting metrics
echo "⏳ Waiting for service to start and report metrics..."
sleep 10

# Check if service is reporting metrics before creating dashboard
MAX_RETRIES=12  # 2 minutes total (12 * 10 seconds)
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "🔍 Checking if service $SERVICE_NAME is reporting metrics... (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
    
    # Check if the service has metrics in Prometheus
    METRICS_RESPONSE=$(curl -s -u "admin:$GRAFANA_PASSWORD" \
        "$GRAFANA_URL/api/datasources/proxy/uid/prometheus/api/v1/query?query=lyku_requests_total%7Bexported_service%3D%22$SERVICE_NAME%22%7D" \
        2>/dev/null || echo '{"data":{"result":[]}}')
    
    METRIC_COUNT=$(echo "$METRICS_RESPONSE" | jq '.data.result | length' 2>/dev/null || echo "0")
    
    if [ "$METRIC_COUNT" -gt 0 ]; then
        echo "✅ Service is reporting metrics!"
        break
    fi
    
    if [ $RETRY_COUNT -eq $((MAX_RETRIES - 1)) ]; then
        echo "⚠️  Service is not reporting metrics yet, but proceeding with dashboard creation"
        echo "   The dashboard will show data once the service starts reporting metrics"
        break
    fi
    
    sleep 10
    ((RETRY_COUNT++))
done

# Generate dashboard
echo "📊 Creating Grafana dashboard for $SERVICE_NAME..."
if "$DASHBOARD_GENERATOR" "$SERVICE_NAME" "$GRAFANA_URL" "$GRAFANA_PASSWORD"; then
    echo ""
    echo "🎉 Deployment and dashboard setup complete!"
    echo "📊 Monitor your service at: $GRAFANA_URL/d/lyku-service-$SERVICE_NAME"
    echo "🏠 Overview dashboard: $GRAFANA_URL/d/lyku-services-v3/lyku-services-overview-clean"
else
    echo "⚠️  Service deployed but dashboard creation failed"
    echo "   You can manually create the dashboard later using:"
    echo "   $DASHBOARD_GENERATOR $SERVICE_NAME"
    exit 1
fi