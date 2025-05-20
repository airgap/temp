import RedisClient from './RedisClient';

// Mock the global fetch API
global.fetch = jest.fn();
global.AbortController = jest.fn().mockImplementation(() => ({
	abort: jest.fn(),
	signal: {},
}));

// Helper function to create a mock Redis response
const createMockResponse = (data: any) => {
	const mockResponse = {
		ok: true,
		status: 200,
		statusText: 'OK',
		arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
	};

	// Mock the arrayBuffer method to return the encoded response
	mockResponse.arrayBuffer.mockImplementation(() => {
		const encoder = new TextEncoder();
		return Promise.resolve(encoder.encode(data).buffer);
	});

	return mockResponse;
};

describe('RedisClient', () => {
	let client: RedisClient;

	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks();

		// Create a new client instance
		client = new RedisClient({
			url: 'redis://localhost:6379',
			password: 'password',
			username: 'username',
			database: 0,
			timeout: 1000,
		});

		// Reset the fetch mock default behavior
		(global.fetch as jest.Mock).mockReset();
	});

	describe('constructor', () => {
		it('should throw an error if url is not provided', () => {
			expect(() => new RedisClient({} as any)).toThrow(
				'Redis connection URL is required',
			);
		});

		it('should correctly parse the Redis URL', () => {
			const clientWithPort = new RedisClient({
				url: 'redis://redis-server:1234',
			});
			expect((clientWithPort as any).host).toBe('redis-server');
			expect((clientWithPort as any).port).toBe(1234);

			const clientWithoutPort = new RedisClient({
				url: 'redis://redis-server',
			});
			expect((clientWithoutPort as any).host).toBe('redis-server');
			expect((clientWithoutPort as any).port).toBe(6379); // Default port

			const clientWithDb = new RedisClient({ url: 'redis://redis-server/5' });
			expect((clientWithDb as any).database).toBe(5);
		});
	});

	describe('sendCommand', () => {
		it('should encode commands correctly', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce(
				createMockResponse('+OK\r\n'),
			);

			await client.set('key', 'value');

			const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
			const fetchUrl = fetchCall[0];
			const fetchOptions = fetchCall[1];

			expect(fetchUrl).toBe('https://localhost:6379/redis');
			expect(fetchOptions.method).toBe('POST');
			expect(fetchOptions.headers['Content-Type']).toBe(
				'application/octet-stream',
			);
			expect(fetchOptions.headers['X-Redis-Auth']).toBe('username:password');
			expect(fetchOptions.headers['X-Redis-DB']).toBe('0');

			// This tests that the command is encoded correctly
			const encoder = new TextEncoder();
			const expectedCommand = encoder.encode(
				'*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nvalue\r\n',
			);
			expect(fetchOptions.body).toEqual(expectedCommand);
		});

		it('should handle errors from Redis', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce(
				createMockResponse('-ERR unknown command\r\n'),
			);

			await expect(client.get('key')).rejects.toThrow(
				'Redis error: ERR unknown command',
			);
		});

		it('should handle HTTP errors', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			});

			await expect(client.get('key')).rejects.toThrow(
				'Redis request failed: 500 Internal Server Error',
			);
		});

		it('should handle timeouts', async () => {
			jest.useFakeTimers();
			(global.fetch as jest.Mock).mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						// This promise never resolves, simulating a timeout
						setTimeout(resolve, 10000);
					}),
			);

			const promise = client.get('key');

			// Fast-forward time to trigger the timeout
			jest.advanceTimersByTime(1000);

			await expect(promise).rejects.toThrow();

			jest.useRealTimers();
		});
	});

	describe('Redis commands', () => {
		describe('STRING operations', () => {
			it('should implement SET command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('+OK\r\n'),
				);

				const result = await client.set('key', 'value');

				expect(result).toBe('OK');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement SET with options', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('+OK\r\n'),
				);

				await client.set('key', 'value', { ex: 10, nx: true });

				const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
				const body = fetchCall[1].body;

				// Check that EX and NX are included in the command
				const decoder = new TextDecoder();
				const command = decoder.decode(body);

				expect(command).toContain('EX');
				expect(command).toContain('10');
				expect(command).toContain('NX');
			});

			it('should implement GET command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('$5\r\nvalue\r\n'),
				);

				const result = await client.get('key');

				expect(result).toBe('value');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should handle null responses from GET', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('$-1\r\n'),
				);

				const result = await client.get('nonexistent');

				expect(result).toBeNull();
			});
		});

		describe('HASH operations', () => {
			it('should implement HSET command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(':1\r\n'),
				);

				const result = await client.hset('hash', 'field', 'value');

				expect(result).toBe(1);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement HGET command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('$5\r\nvalue\r\n'),
				);

				const result = await client.hget('hash', 'field');

				expect(result).toBe('value');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement HGETALL command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(
						'*4\r\n$5\r\nfield1\r\n$6\r\nvalue1\r\n$5\r\nfield2\r\n$6\r\nvalue2\r\n',
					),
				);

				const result = await client.hgetall('hash');

				expect(result).toEqual({
					field1: 'value1',
					field2: 'value2',
				});
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement HMGET command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('*3\r\n$5\r\nvalue1\r\n$-1\r\n$5\r\nvalue3\r\n'),
				);

				const result = await client.hmget('hash', 'field1', 'field2', 'field3');

				expect(result).toEqual(['value1', null, 'value3']);
				expect(global.fetch).toHaveBeenCalledTimes(1);

				// Verify the command format
				const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
				const fetchBody = fetchCall[1].body;
				const decoder = new TextDecoder();
				const command = decoder.decode(fetchBody);

				expect(command).toContain('HMGET');
				expect(command).toContain('hash');
				expect(command).toContain('field1');
				expect(command).toContain('field2');
				expect(command).toContain('field3');
			});

			it('should handle empty fields array in HMGET', async () => {
				const result = await client.hmget('hash');

				expect(result).toEqual([]);
				expect(global.fetch).not.toHaveBeenCalled();
			});

			it('should implement HDEL command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(':2\r\n'),
				);

				const result = await client.hdel('hash', 'field1', 'field2');

				expect(result).toBe(2);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});
		});

		describe('LIST operations', () => {
			it('should implement LPUSH command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(':3\r\n'),
				);

				const result = await client.lpush('list', 'value1', 'value2');

				expect(result).toBe(3);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement RPUSH command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(':3\r\n'),
				);

				const result = await client.rpush('list', 'value1', 'value2');

				expect(result).toBe(3);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement LPOP command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('$6\r\nvalue1\r\n'),
				);

				const result = await client.lpop('list');

				expect(result).toBe('value1');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement RPOP command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('$6\r\nvalue2\r\n'),
				);

				const result = await client.rpop('list');

				expect(result).toBe('value2');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement LRANGE command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('*2\r\n$6\r\nvalue1\r\n$6\r\nvalue2\r\n'),
				);

				const result = await client.lrange('list', 0, 1);

				expect(result).toEqual(['value1', 'value2']);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});
		});

		describe('SET operations', () => {
			it('should implement SADD command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(':2\r\n'),
				);

				const result = await client.sadd('set', 'member1', 'member2');

				expect(result).toBe(2);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement SREM command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(':1\r\n'),
				);

				const result = await client.srem('set', 'member1');

				expect(result).toBe(1);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement SMEMBERS command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('*2\r\n$7\r\nmember1\r\n$7\r\nmember2\r\n'),
				);

				const result = await client.smembers('set');

				expect(result).toEqual(['member1', 'member2']);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});
		});

		describe('SORTED SET operations', () => {
			it('should implement ZRANGE command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(
						'*3\r\n$7\r\nmember1\r\n$7\r\nmember2\r\n$7\r\nmember3\r\n',
					),
				);

				const result = await client.zrange('zset', 0, 2);

				expect(result).toEqual(['member1', 'member2', 'member3']);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement ZRANGE with WITHSCORES', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(
						'*6\r\n$7\r\nmember1\r\n$1\r\n1\r\n$7\r\nmember2\r\n$1\r\n2\r\n$7\r\nmember3\r\n$1\r\n3\r\n',
					),
				);

				// TypeScript should infer that result is Array<[string, string]>
				const result = await client.zrange('zset', 0, 2, { withScores: true });

				// Test that the result is properly typed and formatted
				expect(result).toEqual<Array<[string, string]>>([
					['member1', '1'],
					['member2', '2'],
					['member3', '3'],
				]);
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement ZRANGE with BYSCORE', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('*2\r\n$7\r\nmember1\r\n$7\r\nmember2\r\n'),
				);

				const result = await client.zrange('zset', 1, 2, { byScore: true });

				expect(result).toEqual(['member1', 'member2']);

				// Verify command format
				const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
				const fetchBody = fetchCall[1].body;
				const decoder = new TextDecoder();
				const command = decoder.decode(fetchBody);

				expect(command).toContain('ZRANGE');
				expect(command).toContain('zset');
				expect(command).toContain('BYSCORE');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement ZRANGE with LIMIT', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('*2\r\n$7\r\nmember2\r\n$7\r\nmember3\r\n'),
				);

				const result = await client.zrange('zset', 0, 5, {
					limit: { offset: 1, count: 2 },
				});

				expect(result).toEqual(['member2', 'member3']);

				// Verify command format
				const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
				const fetchBody = fetchCall[1].body;
				const decoder = new TextDecoder();
				const command = decoder.decode(fetchBody);

				expect(command).toContain('ZRANGE');
				expect(command).toContain('zset');
				expect(command).toContain('LIMIT');
				expect(command).toContain('1');
				expect(command).toContain('2');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});

			it('should implement ZRANGE with REV option', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse(
						'*3\r\n$7\r\nmember3\r\n$7\r\nmember2\r\n$7\r\nmember1\r\n',
					),
				);

				const result = await client.zrange('zset', 0, 2, { rev: true });

				expect(result).toEqual(['member3', 'member2', 'member1']);

				// Verify command format
				const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
				const fetchBody = fetchCall[1].body;
				const decoder = new TextDecoder();
				const command = decoder.decode(fetchBody);

				expect(command).toContain('ZRANGE');
				expect(command).toContain('zset');
				expect(command).toContain('REV');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});
		});

		describe('Other commands', () => {
			it('should implement PING command', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce(
					createMockResponse('+PONG\r\n'),
				);

				const result = await client.ping();

				expect(result).toBe('PONG');
				expect(global.fetch).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('Integration with other modules', () => {
		it('should work with getUsers method', async () => {
			// Mock Redis client for a successful cache hit scenario
			(global.fetch as jest.Mock).mockResolvedValueOnce(
				createMockResponse(
					'*2\r\n$17\r\n{"id":1,"name":"User1"}\r\n$17\r\n{"id":2,"name":"User2"}\r\n',
				),
			);

			// Import the getUsers function (mocked for test)
			const getUsers = async (db: any, redis: any, users: bigint[]) => {
				if (!users.length) return [];

				// Try to get users from Redis cache first
				const userIds = users.map((id) => id.toString());
				const userStrings = await redis.hmget(`users`, ...userIds);

				// If we have all users in cache, parse and return them
				const validUserStrings = userStrings.filter(Boolean) as string[];
				if (validUserStrings.length === users.length) {
					return validUserStrings.map((str) => JSON.parse(str));
				}

				// Otherwise fall back to database
				return [];
			};

			// Test that getUsers correctly uses the hmget method
			const result = await getUsers(null, client, [1n, 2n]);

			expect(result).toEqual([
				{ id: 1, name: 'User1' },
				{ id: 2, name: 'User2' },
			]);

			// Verify hmget was called correctly
			const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
			const fetchBody = fetchCall[1].body;
			const decoder = new TextDecoder();
			const command = decoder.decode(fetchBody);

			expect(command).toContain('HMGET');
			expect(command).toContain('users');
			expect(command).toContain('1');
			expect(command).toContain('2');
		});
	});
});
