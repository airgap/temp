/**
 * RedisClient - A lightweight Redis client for Cloudflare Workers
 *
 * This implementation avoids using Node.js-specific dependencies like Buffer, node-redis,
 * or ioredis, making it compatible with Cloudflare Pages/Workers environment.
 */

// RESP (Redis Serialization Protocol) type identifiers
const RESP = {
	SIMPLE_STRING: '+',
	ERROR: '-',
	INTEGER: ':',
	BULK_STRING: '$',
	ARRAY: '*',
	CRLF: '\r\n',
};

class RedisClient {
	/**
	 * Creates a new Redis client
	 *
	 * @param {Object} options - Connection options
	 * @param {string} options.url - Redis server URL (e.g. redis://localhost:6379)
	 * @param {string} [options.password] - Redis password for authentication
	 * @param {string} [options.username] - Redis username for authentication (Redis 6+)
	 * @param {number} [options.database=0] - Redis database index
	 * @param {number} [options.timeout=5000] - Connection timeout in ms
	 */
	constructor(options: {
		url: string;
		password?: string;
		username?: string;
		database?: number;
		timeout?: number;
	}) {
		if (!options || !options.url) {
			throw new Error('Redis connection URL is required');
		}

		this.url = options.url;
		this.password = options.password;
		this.username = options.username;
		this.database = options.database || 0;
		this.timeout = options.timeout || 5000;

		// Initialize TextEncoder and TextDecoder for handling binary data
		this.encoder = new TextEncoder();
		this.decoder = new TextDecoder('utf-8');

		// Extract host and port from URL
		const url = new URL(this.url);
		this.host = url.hostname;
		this.port = url.port ? parseInt(url.port, 10) : 6379;

		// If Redis URL includes a path with a number, treat it as database index
		if (url.pathname && url.pathname.length > 1) {
			const dbIndex = parseInt(url.pathname.substring(1), 10);
			if (!isNaN(dbIndex)) {
				this.database = dbIndex;
			}
		}
	}

	// Private properties
	private url: string;
	private password?: string;
	private username?: string;
	private database: number;
	private timeout: number;
	private encoder: TextEncoder;
	private decoder: TextDecoder;
	private host: string;
	private port: number;

	/**
	 * Encodes a Redis command according to RESP
	 *
	 * @param {string[]} args - Command arguments (e.g. ['SET', 'key', 'value'])
	 * @returns {Uint8Array} - Encoded command ready to send to Redis
	 */
	private encodeCommand(args: string[]): Uint8Array {
		let command = RESP.ARRAY + args.length + RESP.CRLF;

		for (const arg of args) {
			const stringArg = String(arg);
			command +=
				RESP.BULK_STRING + stringArg.length + RESP.CRLF + stringArg + RESP.CRLF;
		}

		return this.encoder.encode(command);
	}

	/**
	 * Parses a Redis response according to RESP
	 *
	 * @param {string} response - Raw Redis response
	 * @returns {any} - Parsed Redis response
	 */
	private parseResponse(response: string): any {
		if (!response || response.length === 0) {
			return null;
		}

		const type = response[0];
		const value = response.substring(1, response.length - 2); // Remove type prefix and trailing CRLF

		switch (type) {
			case RESP.SIMPLE_STRING:
				return value;

			case RESP.ERROR:
				throw new Error(`Redis error: ${value}`);

			case RESP.INTEGER:
				return parseInt(value, 10);

			case RESP.BULK_STRING: {
				const sizeEnd = value.indexOf(RESP.CRLF);
				const size = parseInt(value.substring(0, sizeEnd), 10);

				if (size === -1) {
					return null;
				}

				return value.substring(sizeEnd + 2, sizeEnd + 2 + size);
			}

			case RESP.ARRAY: {
				const sizeEnd = value.indexOf(RESP.CRLF);
				const size = parseInt(value.substring(0, sizeEnd), 10);

				if (size === -1) {
					return null;
				}

				const result = [];
				let currentPos = sizeEnd + 2; // Skip size and CRLF

				for (let i = 0; i < size; i++) {
					const subResponse = response.substring(currentPos);
					const parsed = this.parseResponse(subResponse);
					result.push(parsed);

					// Update position for next element
					const subType = subResponse[0];
					if (subType === RESP.BULK_STRING) {
						const bulkSizeEnd = subResponse.indexOf(RESP.CRLF);
						const bulkSize = parseInt(
							subResponse.substring(1, bulkSizeEnd),
							10,
						);

						if (bulkSize === -1) {
							currentPos += bulkSizeEnd + 4; // -1 + 2 CRLFs
						} else {
							currentPos += bulkSizeEnd + 4 + bulkSize; // Size + 2 CRLFs + content
						}
					} else {
						const nextCRLF = subResponse.indexOf(RESP.CRLF);
						currentPos += nextCRLF + 2;
					}
				}

				return result;
			}

			default:
				throw new Error(`Unknown Redis response type: ${type}`);
		}
	}

	/**
	 * Sends a Redis command and returns the parsed response
	 *
	 * @param {string[]} args - Command arguments (e.g. ['SET', 'key', 'value'])
	 * @returns {Promise<any>} - Parsed Redis response
	 */
	private async sendCommand(args: string[]): Promise<any> {
		const encodedCommand = this.encodeCommand(args);

		// Use fetch API to send the command to Redis
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			// We're using a RESTful interface to Redis via the Fetch API
			// This assumes you've set up a proxy or service that accepts Redis commands over HTTP
			const response = await fetch(`https://${this.host}:${this.port}/redis`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/octet-stream',
					'X-Redis-Auth': this.password
						? `${this.username || ''}:${this.password}`
						: '',
					'X-Redis-DB': String(this.database),
				},
				body: encodedCommand,
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(
					`Redis request failed: ${response.status} ${response.statusText}`,
				);
			}

			const buffer = await response.arrayBuffer();
			const text = this.decoder.decode(buffer);
			return this.parseResponse(text);
		} finally {
			clearTimeout(timeoutId);
		}
	}

	// Implement common Redis commands

	/**
	 * SET key value [EX seconds] [PX milliseconds] [NX|XX]
	 *
	 * @param {string} key - Key to set
	 * @param {string} value - Value to set
	 * @param {Object} [options] - Additional options
	 * @param {number} [options.ex] - Expiry time in seconds
	 * @param {number} [options.px] - Expiry time in milliseconds
	 * @param {boolean} [options.nx] - Only set if key does not exist
	 * @param {boolean} [options.xx] - Only set if key exists
	 * @returns {Promise<string>} - "OK" if successful
	 */
	async set(
		key: string,
		value: string,
		options: {
			ex?: number;
			px?: number;
			nx?: boolean;
			xx?: boolean;
		} = {},
	): Promise<string> {
		const args = ['SET', key, value];

		if (options.ex) args.push('EX', options.ex.toString());
		if (options.px) args.push('PX', options.px.toString());
		if (options.nx) args.push('NX');
		if (options.xx) args.push('XX');

		return this.sendCommand(args);
	}

	/**
	 * GET key
	 *
	 * @param {string} key - Key to get
	 * @returns {Promise<string|null>} - Value of key or null if key does not exist
	 */
	async get(key: string): Promise<string | null> {
		return this.sendCommand(['GET', key]);
	}

	/**
	 * DEL key [key ...]
	 *
	 * @param {...string} keys - Keys to delete
	 * @returns {Promise<number>} - Number of keys deleted
	 */
	async del(...keys: string[]): Promise<number> {
		return this.sendCommand(['DEL', ...keys]);
	}

	/**
	 * EXISTS key [key ...]
	 *
	 * @param {...string} keys - Keys to check
	 * @returns {Promise<number>} - Number of keys that exist
	 */
	async exists(...keys: string[]): Promise<number> {
		return this.sendCommand(['EXISTS', ...keys]);
	}

	/**
	 * EXPIRE key seconds
	 *
	 * @param {string} key - Key to set expiry on
	 * @param {number} seconds - Expiry time in seconds
	 * @returns {Promise<number>} - 1 if successful, 0 if key does not exist
	 */
	async expire(key: string, seconds: number): Promise<number> {
		return this.sendCommand(['EXPIRE', key, seconds.toString()]);
	}

	/**
	 * TTL key
	 *
	 * @param {string} key - Key to get TTL for
	 * @returns {Promise<number>} - TTL in seconds, -1 if no expiry, -2 if key does not exist
	 */
	async ttl(key: string): Promise<number> {
		return this.sendCommand(['TTL', key]);
	}

	/**
	 * INCR key
	 *
	 * @param {string} key - Key to increment
	 * @returns {Promise<number>} - New value
	 */
	async incr(key: string): Promise<number> {
		return this.sendCommand(['INCR', key]);
	}

	/**
	 * DECR key
	 *
	 * @param {string} key - Key to decrement
	 * @returns {Promise<number>} - New value
	 */
	async decr(key: string): Promise<number> {
		return this.sendCommand(['DECR', key]);
	}

	/**
	 * INCRBY key increment
	 *
	 * @param {string} key - Key to increment
	 * @param {number} increment - Increment value
	 * @returns {Promise<number>} - New value
	 */
	async incrby(key: string, increment: number): Promise<number> {
		return this.sendCommand(['INCRBY', key, increment.toString()]);
	}

	/**
	 * DECRBY key decrement
	 *
	 * @param {string} key - Key to decrement
	 * @param {number} decrement - Decrement value
	 * @returns {Promise<number>} - New value
	 */
	async decrby(key: string, decrement: number): Promise<number> {
		return this.sendCommand(['DECRBY', key, decrement.toString()]);
	}

	/**
	 * HSET key field value [field value ...]
	 *
	 * @param {string} key - Hash key
	 * @param {string} field - Field to set
	 * @param {string} value - Value to set
	 * @param {Array} [entries] - Additional field-value pairs
	 * @returns {Promise<number>} - Number of fields set
	 */
	async hset(
		key: string,
		field: string,
		value: string,
		...entries: string[]
	): Promise<number> {
		const args = ['HSET', key, field, value];
		if (entries && entries.length > 0) {
			args.push(...entries);
		}
		return this.sendCommand(args);
	}

	/**
	 * HGET key field
	 *
	 * @param {string} key - Hash key
	 * @param {string} field - Field to get
	 * @returns {Promise<string|null>} - Value of field or null if field does not exist
	 */
	async hget(key: string, field: string): Promise<string | null> {
		return this.sendCommand(['HGET', key, field]);
	}

	/**
	 * HGETALL key
	 *
	 * @param {string} key - Hash key
	 * @returns {Promise<Record<string, string>|null>} - Object with all fields and values
	 */
	async hgetall(key: string): Promise<Record<string, string> | null> {
		const result = await this.sendCommand(['HGETALL', key]);
		if (!result) return null;

		const obj: Record<string, string> = {};
		for (let i = 0; i < result.length; i += 2) {
			obj[result[i]] = result[i + 1];
		}
		return obj;
	}

	/**
	 * HDEL key field [field ...]
	 *
	 * @param {string} key - Hash key
	 * @param {...string} fields - Fields to delete
	 * @returns {Promise<number>} - Number of fields deleted
	 */
	async hdel(key: string, ...fields: string[]): Promise<number> {
		return this.sendCommand(['HDEL', key, ...fields]);
	}

	/**
	 * LPUSH key value [value ...]
	 *
	 * @param {string} key - List key
	 * @param {...string} values - Values to push
	 * @returns {Promise<number>} - Length of list after push
	 */
	async lpush(key: string, ...values: string[]): Promise<number> {
		return this.sendCommand(['LPUSH', key, ...values]);
	}

	/**
	 * RPUSH key value [value ...]
	 *
	 * @param {string} key - List key
	 * @param {...string} values - Values to push
	 * @returns {Promise<number>} - Length of list after push
	 */
	async rpush(key: string, ...values: string[]): Promise<number> {
		return this.sendCommand(['RPUSH', key, ...values]);
	}

	/**
	 * LPOP key
	 *
	 * @param {string} key - List key
	 * @returns {Promise<string|null>} - Value popped or null if list is empty
	 */
	async lpop(key: string): Promise<string | null> {
		return this.sendCommand(['LPOP', key]);
	}

	/**
	 * RPOP key
	 *
	 * @param {string} key - List key
	 * @returns {Promise<string|null>} - Value popped or null if list is empty
	 */
	async rpop(key: string): Promise<string | null> {
		return this.sendCommand(['RPOP', key]);
	}

	/**
	 * LRANGE key start stop
	 *
	 * @param {string} key - List key
	 * @param {number} start - Start index
	 * @param {number} stop - Stop index
	 * @returns {Promise<string[]>} - List of values
	 */
	async lrange(key: string, start: number, stop: number): Promise<string[]> {
		return this.sendCommand(['LRANGE', key, start.toString(), stop.toString()]);
	}

	/**
	 * SADD key member [member ...]
	 *
	 * @param {string} key - Set key
	 * @param {...string} members - Members to add
	 * @returns {Promise<number>} - Number of members added
	 */
	async sadd(key: string, ...members: string[]): Promise<number> {
		return this.sendCommand(['SADD', key, ...members]);
	}

	/**
	 * SREM key member [member ...]
	 *
	 * @param {string} key - Set key
	 * @param {...string} members - Members to remove
	 * @returns {Promise<number>} - Number of members removed
	 */
	async srem(key: string, ...members: string[]): Promise<number> {
		return this.sendCommand(['SREM', key, ...members]);
	}

	/**
	 * SMEMBERS key
	 *
	 * @param {string} key - Set key
	 * @returns {Promise<string[]>} - List of members
	 */
	async smembers(key: string): Promise<string[]> {
		return this.sendCommand(['SMEMBERS', key]);
	}

	/**
	 * PING
	 *
	 * @returns {Promise<string>} - "PONG"
	 */
	async ping(): Promise<string> {
		return this.sendCommand(['PING']);
	}
}

export default RedisClient;
