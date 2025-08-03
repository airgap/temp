import { client as redis } from '@lyku/redis-client';

export class LeaderboardCacheService {
	/**
	 * Generate cache key for leaderboard results
	 */
	private static getCacheKey(
		leaderboardId: bigint | number,
		columnFormat: string,
		orderDirection: string,
	): string {
		return `leaderboard:${leaderboardId}:${columnFormat}:${orderDirection}`;
	}

	/**
	 * Get leaderboard data from cache
	 */
	static async getFromCache(
		leaderboardId: bigint | number,
		columnFormat: string,
		orderDirection: string,
	): Promise<any | null> {
		const cacheKey = this.getCacheKey(
			leaderboardId,
			columnFormat,
			orderDirection,
		);
		const cached = await redis.get(cacheKey);

		if (cached) {
			try {
				return JSON.parse(cached);
			} catch (error) {
				console.warn(
					`Failed to parse cached leaderboard data for key ${cacheKey}:`,
					error,
				);
				// Delete corrupted cache entry
				await redis.del(cacheKey);
				return null;
			}
		}

		return null;
	}

	/**
	 * Cache leaderboard data with TTL
	 */
	static async setCache(
		leaderboardId: bigint | number,
		columnFormat: string,
		orderDirection: string,
		data: any,
		ttlSeconds: number = 600, // 10 minutes default
	): Promise<void> {
		const cacheKey = this.getCacheKey(
			leaderboardId,
			columnFormat,
			orderDirection,
		);

		try {
			await redis.setex(cacheKey, ttlSeconds, JSON.stringify(data));
		} catch (error) {
			console.warn(
				`Failed to cache leaderboard data for key ${cacheKey}:`,
				error,
			);
		}
	}

	/**
	 * Invalidate all cache entries for a specific leaderboard
	 */
	static async invalidateLeaderboard(
		leaderboardId: bigint | number,
	): Promise<void> {
		const pattern = `leaderboard:${leaderboardId}:*`;

		try {
			const keys = await redis.keys(pattern);
			if (keys.length > 0) {
				await redis.del(...keys);
				console.log(
					`Invalidated ${keys.length} cache entries for leaderboard ${leaderboardId}`,
				);
			}
		} catch (error) {
			console.warn(
				`Failed to invalidate cache for leaderboard ${leaderboardId}:`,
				error,
			);
		}
	}

	/**
	 * Check if leaderboard query is slow and should be cached longer
	 */
	static getSuggestedTTL(queryTimeMs: number): number {
		if (queryTimeMs > 5000) {
			return 1800; // 30 minutes for very slow queries
		} else if (queryTimeMs > 2000) {
			return 1200; // 20 minutes for slow queries
		} else if (queryTimeMs > 1000) {
			return 900; // 15 minutes for moderately slow queries
		}
		return 600; // 10 minutes default
	}

	/**
	 * Smart cache invalidation - only invalidate if score might affect top rankings
	 * This is an optimization to reduce cache churn from low scores
	 */
	static async smartInvalidate(
		leaderboardId: bigint | number,
		newScore: any,
		isHighScore: boolean = true,
	): Promise<void> {
		// For now, always invalidate. In the future, this could be enhanced
		// to check if the score would actually make it into top 20 before invalidating
		if (isHighScore) {
			await this.invalidateLeaderboard(leaderboardId);
		}
	}

	/**
	 * Warm cache for popular leaderboards
	 * This would typically be called by a background job
	 */
	static async warmCache(
		leaderboardId: bigint | number,
		fetchFunction: (format: string, direction: string) => Promise<any>,
	): Promise<void> {
		const commonFormats = ['number', 'bigint', 'time', 'text'];
		const directions = ['asc', 'desc'];

		const warmPromises = [];

		for (const format of commonFormats) {
			for (const direction of directions) {
				warmPromises.push(
					fetchFunction(format, direction)
						.then(
							(data) =>
								this.setCache(leaderboardId, format, direction, data, 900), // 15 min for warmed cache
						)
						.catch((error) =>
							console.warn(
								`Failed to warm cache for ${leaderboardId}:${format}:${direction}`,
								error,
							),
						),
				);
			}
		}

		await Promise.allSettled(warmPromises);
	}
}
