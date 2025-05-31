/**
 * HTTP Redis Client for Cloudflare Workers
 * Uses Webdis (HTTP Redis proxy) to communicate with Redis
 */

export class HttpRedisClient {
	private baseUrl: string;
	private auth: string | null = null;

	constructor(url: string) {
		console.log('HttpRedisClient constructor with URL:', url);

		// Parse URL with authentication
		if (url.includes('@')) {
			try {
				const urlObj = new URL(url);
				this.baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

				// Extract basic auth if present
				if (urlObj.username && urlObj.password) {
					this.auth = btoa(
						`${urlObj.username}:${decodeURIComponent(urlObj.password)}`,
					);
					console.log('Extracted auth for user:', urlObj.username);
				}
			} catch (e) {
				console.error('Failed to parse URL:', e);
				this.baseUrl = url;
			}
		} else if (url.startsWith('redis://')) {
			// For internal K8s Redis, use the proxy
			this.baseUrl = 'http://138.197.230.210';
		} else {
			this.baseUrl = url;
		}

		console.log('HttpRedisClient configured:', {
			baseUrl: this.baseUrl,
			hasAuth: !!this.auth,
		});
	}

	/**
	 * Execute a Redis command via HTTP
	 */
	private async execute(command: string, ...args: any[]): Promise<any> {
		// URL encode each argument to handle special characters
		const encodedArgs = args.map((arg) => encodeURIComponent(String(arg)));
		const url = `${this.baseUrl}/${command}/${encodedArgs.join('/')}`;

		console.log('HTTP Redis request:', { command, args, encodedArgs, url });

		try {
			const headers: Record<string, string> = {
				Accept: 'application/json',
			};

			// Add authorization header if we have auth
			if (this.auth) {
				headers['Authorization'] = `Basic ${this.auth}`;
			}

			const response = await fetch(url, {
				method: 'GET',
				headers,
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('HTTP Redis error details:', {
					status: response.status,
					statusText: response.statusText,
					url,
					errorText,
				});
				throw new Error(
					`Redis HTTP error: ${response.status} ${response.statusText}`,
				);
			}

			const data = await response.json();

			// Webdis returns responses in a specific format
			if (data.hasOwnProperty(command.toUpperCase())) {
				return data[command.toUpperCase()];
			}

			return data;
		} catch (error) {
			console.error('HTTP Redis error:', error);
			throw error;
		}
	}

	// Redis commands
	async get(key: string): Promise<string | null> {
		return this.execute('GET', key);
	}

	async set(key: string, value: string, ex?: number): Promise<string> {
		if (ex) {
			return this.execute('SETEX', key, ex, value);
		}
		return this.execute('SET', key, value);
	}

	async del(...keys: string[]): Promise<number> {
		return this.execute('DEL', ...keys);
	}

	async exists(...keys: string[]): Promise<number> {
		return this.execute('EXISTS', ...keys);
	}

	async expire(key: string, seconds: number): Promise<number> {
		return this.execute('EXPIRE', key, seconds);
	}

	async ttl(key: string): Promise<number> {
		return this.execute('TTL', key);
	}

	async incr(key: string): Promise<number> {
		return this.execute('INCR', key);
	}

	async decr(key: string): Promise<number> {
		return this.execute('DECR', key);
	}

	async hget(key: string, field: string): Promise<string | null> {
		return this.execute('HGET', key, field);
	}

	async hset(key: string, field: string, value: string): Promise<number> {
		return this.execute('HSET', key, field, value);
	}

	async hgetall(key: string): Promise<Record<string, string> | null> {
		const result = await this.execute('HGETALL', key);
		if (!result || Object.keys(result).length === 0) {
			return null;
		}
		return result;
	}

	async hmget(key: string, ...fields: string[]): Promise<(string | null)[]> {
		return this.execute('HMGET', key, ...fields) || [];
	}

	async sadd(key: string, ...members: string[]): Promise<number> {
		return this.execute('SADD', key, ...members);
	}

	async srem(key: string, ...members: string[]): Promise<number> {
		return this.execute('SREM', key, ...members);
	}

	async smembers(key: string): Promise<string[]> {
		return this.execute('SMEMBERS', key) || [];
	}

	async ping(): Promise<string> {
		return this.execute('PING');
	}
}
