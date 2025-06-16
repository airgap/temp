# Lyku Service Dashboard Auto-Generation

This system automatically generates comprehensive Grafana dashboards for each Lyku service, providing detailed monitoring of uptime, health, request duration, and error rates.

## Features

Each auto-generated dashboard includes:

- **Service Status**: Real-time UP/DOWN status
- **Average Response Time**: With color-coded thresholds (green < 200ms < yellow < 1000ms < red)
- **Error Rate**: Monitoring HTTP errors per second
- **Memory Usage**: Current memory consumption
- **Request Rate Over Time**: Separate tracking of business requests vs health checks
- **Response Time Trends**: Historical performance data
- **Memory Usage Trends**: Memory consumption over time
- **Error Rate & In-Flight Requests**: Detailed error monitoring

## Scripts

### 1. `deploy-route`

Fast deployment script for services (optimized for speed).

```bash
# Usage
./deploy-route <service-name>

# Example
./deploy-route list-hot-posts
```

### 2. `graph-route`

Create or update Grafana dashboard for a deployed service.

```bash
# Usage
./graph-route <service-name> [--wait-for-metrics]

# Examples
./graph-route list-hot-posts                    # Create dashboard immediately
./graph-route new-service --wait-for-metrics   # Wait for metrics first

# Environment variables
export GRAFANA_URL="http://your-grafana:3000"
export GRAFANA_PASSWORD="your-password"
```

**Features:**

- Fast dashboard creation for existing services
- Optional waiting for metrics availability
- Clear feedback and dashboard URLs
- Configurable via environment variables

### 3. `generate-service-dashboard.sh`

Low-level script to generate a dashboard for a single service.

```bash
# Usage
./generate-service-dashboard.sh <service-name> [grafana-url] [admin-password]

# Examples
./generate-service-dashboard.sh list-hot-posts
./generate-service-dashboard.sh get-posts http://localhost:3002 prom-operator
```

### 4. `generate-all-dashboards.sh`

Automatically discovers all services with metrics and creates dashboards for them.

```bash
# Usage
./generate-all-dashboards.sh [grafana-url] [admin-password]

# Example
./generate-all-dashboards.sh
```

### 5. `deploy-with-dashboard.sh`

Legacy combined deployment script (prefer using deploy-route + graph-route separately).

```bash
# Usage
./deploy-with-dashboard.sh <service-name> [additional-deploy-args...]

# Examples
./deploy-with-dashboard.sh new-service
./deploy-with-dashboard.sh list-hot-posts --force
```

## Integration with Deployment

### Option 1: Separated Workflow (Recommended - Fastest)

Deploy services quickly, then create dashboards as needed:

```bash
# Step 1: Deploy service (fast)
./scripts/deploy-route your-service-name

# Step 2: Create dashboard when needed
./scripts/graph-route your-service-name
```

### Option 2: Create Dashboard with Metrics Check

For new services, wait for metrics before creating dashboard:

```bash
# Deploy service
./scripts/deploy-route your-service-name

# Create dashboard after service is reporting metrics
./scripts/graph-route your-service-name --wait-for-metrics
```

### Option 3: Bulk Dashboard Generation

For existing services, generate all dashboards at once:

```bash
./scripts/generate-all-dashboards.sh
```

### Option 4: Legacy Combined Deployment

Use the all-in-one script (slower due to waiting):

```bash
./scripts/deploy-with-dashboard.sh your-service-name
```

## Environment Variables

You can customize the scripts using environment variables:

```bash
export GRAFANA_URL="http://your-grafana-instance:3000"
export GRAFANA_PASSWORD="your-admin-password"
```

## Dashboard Access

- **Individual Service Dashboard**: `http://grafana-url/d/lyku-service-{service-name}/{service-name}-service-dashboard`
- **Overview Dashboard**: `http://grafana-url/d/lyku-services-v3/lyku-services-overview-clean`
- **All Dashboards**: `http://grafana-url/dashboards`

## Requirements

- Grafana with admin access
- Prometheus data source configured
- Services must be reporting Lyku metrics (`lyku_requests_total`, etc.)
- `jq` command-line tool for JSON processing
- `curl` for API calls

## Troubleshooting

### Service Not Showing Data

1. Verify the service is running: `kubectl get pods -l app=lyku-{service-name}`
2. Check if metrics are being exported: `curl http://service:3000/metrics`
3. Verify Prometheus is scraping: Check Prometheus targets page

### Dashboard Creation Fails

1. Check Grafana credentials and URL
2. Verify Grafana API access: `curl -u admin:password http://grafana-url/api/health`
3. Check template file exists: `ls k8s/service-dashboard-template.json`

### No Metrics Available

1. Ensure service has the correct labels for ServiceMonitor discovery
2. Check ServiceMonitor is applied: `kubectl get servicemonitor -n kube-prometheus-stack`
3. Verify Prometheus configuration includes the ServiceMonitor

## Customization

To modify the dashboard template:

1. Edit `k8s/service-dashboard-template.json`
2. Use `{{SERVICE_NAME}}` and `{{SERVICE_TITLE}}` as placeholders
3. Test with a single service before bulk generation

## Example Workflow

### Fast Deployment Workflow (Recommended)

```bash
# 1. Deploy service quickly
./scripts/deploy-route your-service-name

# 2. Create dashboard when needed (immediately or later)
./scripts/graph-route your-service-name

# 3. Access dashboard
open http://localhost:3002/d/lyku-service-your-service-name
```

### New Service Workflow (with metrics check)

```bash
# 1. Deploy new service
./scripts/deploy-route your-service-name

# 2. Create dashboard after metrics are available
./scripts/graph-route your-service-name --wait-for-metrics

# 3. Monitor service
open http://localhost:3002/d/lyku-service-your-service-name
```

### Legacy Combined Workflow

```bash
# Deploy and create dashboard in one step (slower)
./scripts/deploy-with-dashboard.sh your-service-name
```
