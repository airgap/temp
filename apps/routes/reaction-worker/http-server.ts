import { ReactionWorkerService } from '.';

export class HealthCheckServer {
	private server: any;
	private workerService: ReactionWorkerService;
	private port: number;

	constructor(port: number = 3000, workerService: ReactionWorkerService) {
		this.workerService = workerService;
		this.port = port;

		// Start server
		this.server = Bun.serve({
			port: this.port,
			fetch: async (req) => {
				const url = new URL(req.url);

				switch (url.pathname) {
					case '/health':
						console.debug('Health check requested');
						return new Response(':D', { status: 200 });

					case '/readiness':
						try {
							// Check if the worker service is healthy
							const isReady = await this.checkServiceHealth();

							if (isReady) {
								return new Response(JSON.stringify({ status: 'ready' }), {
									status: 200,
									headers: { 'Content-Type': 'application/json' },
								});
							} else {
								return new Response(JSON.stringify({ status: 'not ready' }), {
									status: 503,
									headers: { 'Content-Type': 'application/json' },
								});
							}
						} catch (error) {
							console.error('Readiness check failed', { error });
							return new Response(
								JSON.stringify({
									status: 'error',
									message: 'Internal server error',
								}),
								{
									status: 500,
									headers: { 'Content-Type': 'application/json' },
								},
							);
						}

					case '/liveness':
						// If the server can respond at all, it's alive
						return new Response(JSON.stringify({ status: 'alive' }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						});

					default:
						return new Response(JSON.stringify({ error: 'Not found' }), {
							status: 404,
							headers: { 'Content-Type': 'application/json' },
						});
				}
			},
		});

		console.info(`Health check server running on port ${port}`);
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
		if (this.server) {
			console.info('Stopping health check server');
			this.server.stop();
			console.info('Health check server stopped');
		}
	}
}

export function startHealthCheckServer(
	port: number,
	workerService: ReactionWorkerService,
): HealthCheckServer {
	return new HealthCheckServer(port, workerService);
}
