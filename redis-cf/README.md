# Redis Client for Cloudflare Workers

A lightweight, efficient Redis client implementation for Cloudflare Workers that doesn't rely on banned dependencies like Buffer, node-redis, or ioredis.

## Features

- No Node.js-specific dependencies
- Uses Web API standards (TextEncoder/TextDecoder, Fetch API)
- RESP (Redis Serialization Protocol) implementation
- Support for common Redis commands
- Compatible with Cloudflare Workers environment
- Configurable timeout and authentication

## Installation

```bash
npm install redis-cf
```

Or simply copy the `redis-client.js` file into your project.

## Usage

### Basic Usage

```javascript
import RedisClient from './redis-client.js';

// In your Cloudflare Worker
export default {
	async fetch(request, env, ctx) {
		const redis = new RedisClient({
			url: env.REDIS_URL,
			password: env.REDIS_PASSWORD,
			database: 0,
			timeout: 5000,
		});

		// Use Redis commands
		await redis.set('key', 'value');
		const value = await redis.get('key');

		return new Response(`Value: ${value}`);
	},
};
```

### Connection Options

```javascript
const redis = new RedisClient({
	url: 'redis://hostname:6379', // Required
	username: 'username', // Optional, for Redis 6+ ACL
	password: 'password', // Optional
	database: 0, // Optional, defaults to 0
	timeout: 5000, // Optional, defaults to 5000ms
});
```

### Supported Commands

The client supports the following Redis commands:

#### Strings

- `set(key, value, options)`
- `get(key)`

#### Keys

- `del(...keys)`
- `exists(...keys)`
- `expire(key, seconds)`
- `ttl(key)`

#### Counters

- `incr(key)`
- `decr(key)`
- `incrby(key, increment)`
- `decrby(key, decrement)`

#### Hashes

- `hset(key, field, value, ...entries)`
- `hget(key, field)`
- `hgetall(key)`
- `hdel(key, ...fields)`

#### Lists

- `lpush(key, ...values)`
- `rpush(key, ...values)`
- `lpop(key)`
- `rpop(key)`
- `lrange(key, start, stop)`

#### Sets

- `sadd(key, ...members)`
- `srem(key, ...members)`
- `smembers(key)`

#### Connection

- `ping()`

## Important Implementation Notes

### Redis Connectivity

The default implementation uses HTTP to communicate with Redis, which requires a proxy service or adapter that can convert HTTP requests to Redis protocol. There are several approaches to make this work:

1. **Upstash Redis REST API**: A hosted Redis service with a REST API
2. **Custom HTTP-to-Redis proxy**: Deploy a service that converts HTTP to Redis protocol
3. **WebSocket implementation**: Modify the client to use WebSockets instead of HTTP
4. **Cloudflare integration**: Use Cloudflare's built-in Redis integration if available

### Direct TCP Connection

The implementation can be modified to use direct TCP connections if your Cloudflare Workers environment supports it:

```javascript
// Example modification for direct TCP connection (if supported)
async sendCommand(args) {
  const encodedCommand = this.encodeCommand(args);

  // Use TCP socket if available in your environment
  const socket = new TCPSocket(this.host, this.port);
  await socket.connect();

  if (this.password) {
    await socket.write(this.encodeCommand(['AUTH', this.password]));
    await socket.read(); // Read AUTH response
  }

  if (this.database !== 0) {
    await socket.write(this.encodeCommand(['SELECT', this.database]));
    await socket.read(); // Read SELECT response
  }

  await socket.write(encodedCommand);
  const response = await socket.read();
  socket.close();

  return this.parseResponse(this.decoder.decode(response));
}
```

## Performance Optimization

For production use, consider these optimizations:

1. **Connection Pooling**: Maintain a pool of connections to Redis to reduce connection overhead
2. **Pipelining**: Batch multiple commands together to reduce round-trip times
3. **Caching**: Cache frequent Redis operations at the edge
4. **Compression**: Compress large values before storing in Redis

## License

MIT
