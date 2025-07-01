import { encode, decode } from '@msgpack/msgpack';
import { unpack } from 'msgpackr';

export const load = async ({ cookies }) => {
	console.log('Loading /up - Route Metrics Overview');

	const start = Date.now();

	try {
		// Get session ID from cookies (for potential auth)
		const sessionId = cookies.get('sessionId');

		// Make API call to list-route-metrics
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
		const response = unpack(new Uint8Array(buffer)) as any;

		const end = Date.now();
		console.log('Route metrics loaded in', end - start, 'ms');
		console.log('Response size:', buffer.byteLength, 'bytes');
		console.log('Services count:', response.metrics?.length || 0);

		return {
			metrics: response.metrics || [],
			timestamp: response.timestamp || Date.now(),
			loadTime: end - start,
		};
	} catch (error) {
		console.error('Failed to fetch route metrics:', error);
		// Return empty data on error
		return {
			metrics: [],
			timestamp: Date.now(),
			loadTime: 0,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
};
