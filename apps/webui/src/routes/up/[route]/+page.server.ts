import { encode, decode } from '@msgpack/msgpack';
import { error } from '@sveltejs/kit';

export const load = async ({ params, cookies }) => {
	const routeName = params.route;
	console.log(`Loading /up/${routeName} - Service Detail`);

	const start = Date.now();

	try {
		// Get session ID from cookies (for potential auth)
		const sessionId = cookies.get('sessionId');

		// Make API call to list-route-metrics for all services
		const res = await fetch('https://api.lyku.org/list-route-metrics', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-msgpack',
				...(sessionId ? { Authorization: `Bearer ${sessionId}` } : {}),
				'User-Agent': 'Mozilla/5.0 (compatible; Lyku/1.0; +https://lyku.org)',
			},
			body: encode({}),
		});

		if (!res.ok) {
			throw new Error(`API request failed: ${res.status} ${res.statusText}`);
		}

		const buffer = await res.arrayBuffer();
		const response = decode(new Uint8Array(buffer), {
			useBigInt64: true,
		}) as any;

		const end = Date.now();
		console.log('Route metrics loaded in', end - start, 'ms');

		// Find the specific service
		const metrics = response.metrics || [];
		const serviceMetrics = metrics.find((m: any) => m.service === routeName);

		if (!serviceMetrics) {
			throw error(404, `Service "${routeName}" not found`);
		}

		// For demo purposes, generate some historical uptime data
		// In a real implementation, this would come from the Redis historical data
		const generateUptimeHistory = () => {
			const history = [];
			const now = Date.now();
			const dayMs = 24 * 60 * 60 * 1000;

			for (let i = 29; i >= 0; i--) {
				const date = new Date(now - i * dayMs);
				const uptime =
					Math.random() > 0.05
						? 95 + Math.random() * 5 // Normal day: 95-100%
						: Math.random() * 95; // Bad day: 0-95%

				history.push({
					date: date.toISOString().split('T')[0],
					uptime: uptime,
					incidents: uptime < 99 ? Math.floor(Math.random() * 3) + 1 : 0,
				});
			}
			return history;
		};

		const generateResponseTimeHistory = () => {
			const history = [];
			const now = Date.now();
			const hourMs = 60 * 60 * 1000;

			for (let i = 23; i >= 0; i--) {
				const hour = new Date(now - i * hourMs);
				const baseTime = serviceMetrics.responseTime || 50;
				const responseTime = baseTime + (Math.random() - 0.5) * baseTime * 0.5;

				history.push({
					hour: hour.toISOString().split('T')[1].substring(0, 5),
					responseTime: Math.max(1, responseTime),
				});
			}
			return history;
		};

		return {
			service: serviceMetrics,
			allMetrics: metrics,
			uptimeHistory: generateUptimeHistory(),
			responseTimeHistory: generateResponseTimeHistory(),
			timestamp: response.timestamp || Date.now(),
			loadTime: end - start,
		};
	} catch (err) {
		console.error('Failed to fetch service metrics:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		throw error(
			500,
			`Failed to load service metrics: ${err instanceof Error ? err.message : 'Unknown error'}`,
		);
	}
};
