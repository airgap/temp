import { client as redis } from '@lyku/redis-client';

/**
 * Redis-based distributed lock for preventing replica interference
 */
export class RedisLock {
	private lockKey: string;
	private lockValue: string;
	private ttlMs: number;
	private refreshInterval: NodeJS.Timeout | null = null;

	/**
	 * Creates a new Redis lock instance
	 * @param serviceName - Name of the service (used as lock key prefix)
	 * @param ttlMs - Lock TTL in milliseconds
	 */
	constructor(serviceName: string, ttlMs: number) {
		this.lockKey = `service:lock:${serviceName}`;
		this.lockValue = `${Date.now()}-${Math.random()}`;
		this.ttlMs = ttlMs;
	}

	/**
	 * Attempts to acquire the lock
	 * @returns Promise<boolean> - true if lock was acquired, false otherwise
	 */
	async acquire(): Promise<boolean> {
		try {
			// Try to acquire lock with NX (only if not exists) and PX (expire in milliseconds)
			const result = await redis.set(
				this.lockKey,
				this.lockValue,
				'PX',
				this.ttlMs,
				'NX',
			);

			if (result === 'OK') {
				console.info(`Lock acquired for ${this.lockKey}`);
				this.startRefresh();
				return true;
			}

			console.debug(`Failed to acquire lock for ${this.lockKey}`);
			return false;
		} catch (error) {
			console.error('Error acquiring lock:', error);
			return false;
		}
	}

	/**
	 * Releases the lock (only if we own it)
	 */
	async release(): Promise<void> {
		try {
			this.stopRefresh();

			// Only release if we own the lock (atomic check and delete)
			const script = `
				if redis.call("get", KEYS[1]) == ARGV[1] then
					return redis.call("del", KEYS[1])
				else
					return 0
				end
			`;

			await redis.eval(script, 1, this.lockKey, this.lockValue);
			console.info(`Lock released for ${this.lockKey}`);
		} catch (error) {
			console.error('Error releasing lock:', error);
		}
	}

	/**
	 * Starts automatic lock refresh at half the TTL interval
	 */
	private startRefresh(): void {
		// Refresh the lock at half the TTL interval
		const refreshMs = Math.floor(this.ttlMs / 2);

		this.refreshInterval = setInterval(async () => {
			try {
				// Only refresh if we still own the lock (atomic check and refresh)
				const script = `
					if redis.call("get", KEYS[1]) == ARGV[1] then
						return redis.call("pexpire", KEYS[1], ARGV[2])
					else
						return 0
					end
				`;

				const result = await redis.eval(
					script,
					1,
					this.lockKey,
					this.lockValue,
					this.ttlMs,
				);

				if (result === 1) {
					console.debug(`Lock refreshed for ${this.lockKey}`);
				} else {
					console.warn(`Lost lock ownership for ${this.lockKey}`);
					this.stopRefresh();
				}
			} catch (error) {
				console.error('Error refreshing lock:', error);
			}
		}, refreshMs);
	}

	/**
	 * Stops the automatic refresh interval
	 */
	private stopRefresh(): void {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
		}
	}
}
