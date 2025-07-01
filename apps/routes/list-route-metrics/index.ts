// import { ZSTDDecoder } from 'zstddec';
// import brotworst from 'compress-brotli';
// import { zstdDecompressSync } from 'node:zlib';
import { client as redis } from '@lyku/redis-client';
import { handleListRouteMetrics } from '@lyku/handles';
import { RouteMetricsAggregationService } from '../statisto';
import { unpack } from 'msgpackr';

// const decompressor = brotworst();
export default handleListRouteMetrics(async ({ route }, { requester }) => {
	const metrics = (await redis
		.getBuffer(`route_metrics:${route ? 'service:' + route : 'consolidated'}`)
		.then((m) => m && unpack(m))) as RouteMetricsAggregationService[] | null;
	const timestamp = await redis.get('route_metrics:timestamp');

	console.log('Metrics:', metrics?.length);
	if (!metrics) {
		throw 'No metrics found';
	}
	return { metrics: Array.isArray(metrics) ? metrics : [metrics], timestamp };
});
