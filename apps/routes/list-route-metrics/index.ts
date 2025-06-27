// import { ZSTDDecoder } from 'zstddec';
// import brotworst from 'compress-brotli';
// import { zstdDecompressSync } from 'node:zlib';
import { client as redis } from '@lyku/redis-client';
import { client as pg } from '@lyku/postgres-client';
import { FileDoc, Post, Reaction, User } from '@lyku/json-models';
import { bondIds } from '@lyku/helpers';
import { parsePossibleBON } from 'from-schema';
import { handleListRouteMetrics } from '@lyku/handles';
import { defaultLogger } from '@lyku/logger';
import { RouteMetricsAggregationService } from '../statisto';

// const decompressor = brotworst();
export default handleListRouteMetrics(async ({ route }, { requester }) => {
	const metrics = (await redis.get(
		`route_metrics:${route ? 'service:' + route : 'consolidated'}`,
	)) as RouteMetricsAggregationService[] | null;

	console.log('Metrics:', metrics?.length);
	if (!metrics) {
		throw 'No metrics found';
	}
	return Array.isArray(metrics) ? metrics : [metrics];
});
