// libs/route-helpers/src/metrics.ts
interface ServiceMetrics {
	requests_total: number;
	requests_duration_ms: number[];
	requests_errors_total: number;
	websocket_connections_active?: number;
	websocket_messages_sent?: number;
	memory_usage_bytes?: number;
	requests_in_flight?: number;
	health_checks_total?: number;
}

class MetricsCollector {
	private metrics: ServiceMetrics = {
		requests_total: 0,
		requests_duration_ms: [],
		requests_errors_total: 0,
		websocket_connections_active: 0,
		websocket_messages_sent: 0,
		requests_in_flight: 0,
		health_checks_total: 0,
	};

	private serviceName: string;

	constructor(serviceName: string) {
		this.serviceName = serviceName;

		// Track memory usage
		setInterval(() => {
			this.metrics.memory_usage_bytes = process.memoryUsage().heapUsed;
		}, 30000); // Every 30 seconds
	}

	// Method to track request start
	startRequest(path?: string) {
		const startTime = Date.now();

		// Skip metrics collection for health checks and metrics endpoint
		const isHealthCheck =
			path && (path.includes('/health') || path.includes('/metrics'));

		if (!isHealthCheck) {
			this.metrics.requests_in_flight =
				(this.metrics.requests_in_flight || 0) + 1;
		}

		// Return a function to call when request finishes
		return (statusCode?: number) => {
			const duration = Date.now() - startTime;

			if (isHealthCheck) {
				// Track health checks separately
				this.metrics.health_checks_total =
					(this.metrics.health_checks_total || 0) + 1;
			} else {
				// Only track non-health-check requests
				this.metrics.requests_total++;
				this.metrics.requests_duration_ms.push(duration);
				this.metrics.requests_in_flight = Math.max(
					0,
					(this.metrics.requests_in_flight || 0) - 1,
				);

				// Keep only last 1000 measurements to prevent memory leak
				if (this.metrics.requests_duration_ms.length > 1000) {
					this.metrics.requests_duration_ms =
						this.metrics.requests_duration_ms.slice(-1000);
				}

				if (statusCode && statusCode >= 400) {
					this.metrics.requests_errors_total++;
				}
			}
		};
	}

	// WebSocket connection tracking
	addWebSocketConnection() {
		this.metrics.websocket_connections_active =
			(this.metrics.websocket_connections_active || 0) + 1;
	}

	removeWebSocketConnection() {
		this.metrics.websocket_connections_active = Math.max(
			0,
			(this.metrics.websocket_connections_active || 0) - 1,
		);
	}

	incrementWebSocketMessages() {
		this.metrics.websocket_messages_sent =
			(this.metrics.websocket_messages_sent || 0) + 1;
	}

	// Generate Prometheus format metrics
	getPrometheusMetrics(): string {
		const avgResponseTime =
			this.metrics.requests_duration_ms.length > 0
				? this.metrics.requests_duration_ms.reduce((a, b) => a + b, 0) /
					this.metrics.requests_duration_ms.length
				: 0;

		return `
# HELP lyku_requests_total Total number of HTTP requests
# TYPE lyku_requests_total counter
lyku_requests_total{service="${this.serviceName}"} ${this.metrics.requests_total}

# HELP lyku_requests_duration_ms Average request duration in milliseconds
# TYPE lyku_requests_duration_ms gauge
lyku_requests_duration_ms{service="${this.serviceName}"} ${avgResponseTime.toFixed(2)}

# HELP lyku_requests_errors_total Total number of HTTP errors (4xx, 5xx)
# TYPE lyku_requests_errors_total counter
lyku_requests_errors_total{service="${this.serviceName}"} ${this.metrics.requests_errors_total}

# HELP lyku_requests_in_flight Current number of requests being processed
# TYPE lyku_requests_in_flight gauge
lyku_requests_in_flight{service="${this.serviceName}"} ${this.metrics.requests_in_flight || 0}

# HELP lyku_memory_usage_bytes Current memory usage in bytes
# TYPE lyku_memory_usage_bytes gauge
lyku_memory_usage_bytes{service="${this.serviceName}"} ${this.metrics.memory_usage_bytes || 0}

# HELP lyku_websocket_connections_active Currently active WebSocket connections
# TYPE lyku_websocket_connections_active gauge
lyku_websocket_connections_active{service="${this.serviceName}"} ${this.metrics.websocket_connections_active || 0}

# HELP lyku_websocket_messages_sent_total Total WebSocket messages sent
# TYPE lyku_websocket_messages_sent_total counter
lyku_websocket_messages_sent_total{service="${this.serviceName}"} ${this.metrics.websocket_messages_sent || 0}

# HELP lyku_health_checks_total Total number of health check requests
# TYPE lyku_health_checks_total counter
lyku_health_checks_total{service="${this.serviceName}"} ${this.metrics.health_checks_total || 0}
    `.trim();
	}

	// Bun fetch handler for metrics endpoint
	getMetricsHandler() {
		return (): Response => {
			return new Response(this.getPrometheusMetrics(), {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
				},
			});
		};
	}
}

export { MetricsCollector };
