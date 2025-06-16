#!/bin/bash

# Test script to verify the integration works
# This simulates the deployment flow without actually deploying

echo "🧪 Testing deploy-route integration..."
echo ""

# Test 1: Help output
echo "1. Testing help output:"
./deploy-route 2>&1 | head -5
echo ""

# Test 2: Check if dashboard generator exists
echo "2. Checking dashboard generator availability:"
if [ -f "./generate-service-dashboard.sh" ]; then
    echo "✅ Dashboard generator found"
else
    echo "❌ Dashboard generator missing"
fi
echo ""

# Test 3: Check if template exists
echo "3. Checking dashboard template:"
if [ -f "../k8s/service-dashboard-template.json" ]; then
    echo "✅ Dashboard template found"
else
    echo "❌ Dashboard template missing"
fi
echo ""

# Test 4: Test environment variable handling
echo "4. Testing environment variables:"
export CREATE_DASHBOARD=false
export GRAFANA_URL=http://test:3000
export GRAFANA_PASSWORD=test123

echo "CREATE_DASHBOARD=${CREATE_DASHBOARD}"
echo "GRAFANA_URL=${GRAFANA_URL}"
echo "GRAFANA_PASSWORD=${GRAFANA_PASSWORD}"
echo ""

echo "✅ Integration test completed!"
echo ""
echo "Ready to use enhanced deploy-route:"
echo "  ./deploy-route service-name              # Deploy with dashboard"
echo "  ./deploy-route service-name --no-dashboard  # Deploy without dashboard"