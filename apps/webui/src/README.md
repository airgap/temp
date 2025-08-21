# Redis Client for Cloudflare Workers

This directory contains a custom Redis client implementation that's compatible with Cloudflare Workers, avoiding the banned dependencies like Buffer, node-redis, and ioredis.

## Implementation Details

The implementation consists of two main parts:

1. `redis-client.ts`: A lightweight Redis client that:
   - Uses Web API standards (TextEncoder/TextDecoder, Fetch API)
   - Implements RESP (Redis Serialization Protocol)
   - Supports common Redis commands
   - Is compatible with Cloudflare Workers environment

2. Adapted `getLikesForPosts.server.ts`: Modified to use our custom Redis client instead of the Node.js redis client.

## Usage

To use the Redis client in your Cloudflare Worker:

```typescript
import RedisClient from '../redis-client';

// Create a Redis client instance
const redis = new RedisClient({
	url: 'redis://your-redis-host:6379',
	password: 'your-password',
	username: 'your-username',
	database: 0,
	timeout: 5000,
});

// Use Redis commands
await redis.set('key', 'value');
const value = await redis.get('key');
```

## Redis Protocol Proxy

Note that this implementation assumes you have a proxy or service that accepts Redis commands over HTTP and forwards them to your Redis server. For direct implementation in Cloudflare Workers, you'll need to either:

1. Use a Redis service with a REST API (like Upstash)
2. Set up a custom HTTP-to-Redis proxy
3. Modify the client to use WebSockets if your use case allows it

## Supported Commands

The client supports all essential Redis commands including:

- String operations: `get`, `set`
- Key operations: `del`, `exists`, `expire`, `ttl`
- Counter operations: `incr`, `decr`, `incrby`, `decrby`
- Hash operations: `hset`, `hget`, `hgetall`, `hdel`
- List operations: `lpush`, `rpush`, `lpop`, `rpop`, `lrange`
- Set operations: `sadd`, `srem`, `smembers`
- Connection operations: `ping`
