import express from 'express';
import { createLogger } from '@lyku/logger';
import { RouteMetricsAggregationService } from '.';

export class HealthCheckServer {
	private app: express.Application;
	private server: any;
	private logger: any;
	private workerService: RouteMetricsAggregationService;

	constructor(
		port: number = 8080,
		workerService: RouteMetricsAggregationService,
	) {
		this.app = express();
		this.workerService = workerService;
		this.logger = createLogger({
			level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
			name: 'statisto-http',
		});

		// Configure routes
		this.configureRoutes();

		// Start server
		this.server = this.app.listen(port, () => {
			this.logger.info(`Health check server running on port ${port}`);
		});
	}

	private configureRoutes(): void {
		// Simple health check endpoint
		this.app.get('/health', (req, res) => {
			this.logger.debug('Health check requested');
			res.status(200).send(':D');
		});

		// More detailed readiness check that can be used by Kubernetes
		this.app.get('/readiness', async (req, res) => {
			try {
				// Check if the worker service is healthy
				const isReady = await this.checkServiceHealth();

				if (isReady) {
					res.status(200).send({ status: 'ready' });
				} else {
					res.status(503).send({ status: 'not ready' });
				}
			} catch (error) {
				this.logger.error('Readiness check failed', { error });
				res
					.status(500)
					.send({ status: 'error', message: 'Internal server error' });
			}
		});

		// Liveness probe
		this.app.get('/liveness', (req, res) => {
			// If the server can respond at all, it's alive
			res.status(200).send({ status: 'alive' });
		});

		// Catch-all for 404
		this.app.use((req, res) => {
			res.status(404).send({ error: 'Not found' });
		});
	}

	private async checkServiceHealth(): Promise<boolean> {
		try {
			// This would typically check connections to Redis and database
			// For now, we'll just return true if the worker service exists
			return !!this.workerService;
		} catch (error) {
			this.logger.error('Service health check failed', { error });
			return false;
		}
	}

	public async stop(): Promise<void> {
		return new Promise((resolve) => {
			if (this.server) {
				this.logger.info('Stopping health check server');
				this.server.close(() => {
					this.logger.info('Health check server stopped');
					resolve();
				});
			} else {
				resolve();
			}
		});
	}
}

export function startHealthCheckServer(
	port: number,
	workerService: RouteMetricsAggregationService,
): HealthCheckServer {
	return new HealthCheckServer(port, workerService);
}
