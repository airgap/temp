##### Note: this README is mostly LLM generated from the source code as this project is not even closed to finished yet and I'm not manually maintaining a README until everything's somewhat stable.

# Route Helpers

A collection of utility functions and types for building HTTP and WebSocket servers in TypeScript, with a focus on type safety and real-time communication.

## Key Features

- Type-safe HTTP and WebSocket server setup
- Session management and authentication
- Database integration with Kysely
- MessagePack encoding/decoding
- NATS integration for pub/sub messaging
- Internationalization support
- Tic Tac Flow game logic helpers
- Achievement and points system
- Notification system

## Core Components

### Server Setup

```typescript
import { serveHttp, serveWebsocket } from '@lyku/route-helpers';

// HTTP Server
serveHttp({
	execute: handler,
	validator: myValidator,
	model: myModel,
});

// WebSocket Server
serveWebsocket({
	onOpen: wsHandler,
	validator: myValidator,
	tweakValidator: myTweakValidator,
	model: myModel,
});
```

### Context Types

The library provides several context types for different scenarios:

- `SecureContext` - For authenticated requests
- `MaybeSecureContext` - For optionally authenticated requests
- `HttpContextFragment` - HTTP-specific context
- `SecurityContextFragment` - Authentication-related context

### Session Management

```typescript
import { createSessionForUser, generateSessionId } from '@lyku/route-helpers';

// Create a new session
const sessionId = await createSessionForUser(userId, context);

// Validate session ID
if (isSessionId(token)) {
	// Process authenticated request
}
```

### Database Integration

```typescript
import { db } from '@lyku/route-helpers';

// Query example
const result = await db.selectFrom('users').selectAll().where('id', '=', userId).executeTakeFirst();
```

### Notifications

```typescript
import { sendNotification } from '@lyku/route-helpers';

await sendNotification(
	{
		user: userId,
		title: 'Achievement Unlocked!',
		body: 'You reached level 10',
		icon: '/achievements/level10.png',
	},
	db,
);
```

### Game Helpers

```typescript
import { checkWin, placePieceInMatch } from '@lyku/route-helpers';

// Check for win condition
const hasWon = checkWin(board, player);

// Place a piece on the board
const updatedMatch = placePieceInMatch(player, square, match);
```

## Environment Configuration

The library expects the following environment variables:

- `SERVICE_PORT` - Server port (default: from apiPorts.http)
- `DOPPLER_ENVIRONMENT` - Environment type ('dev' or production)
- `PG_CONNECTION_STRING` - PostgreSQL connection string
- `NATS_PORT` - NATS server connection string
- `WEBUI_DOMAIN` - Web UI domain
- `SHORTLINK_DOMAIN` - URL shortener domain

## Type Safety

The library leverages TypeScript for type safety and includes:

- Validator support for request/response validation
- Type-safe database queries with Kysely
- Strongly typed WebSocket messages
- Type-safe context objects

## Internationalization

```typescript
import { getDictionary } from '@lyku/route-helpers';

// Get dictionary based on request headers
const dictionary = getDictionary(request);
```

## Achievement System

```typescript
import { grantAchievementToUser, grantPointsToUser } from '@lyku/route-helpers';

// Grant achievement
await grantAchievementToUser(achievementId, userId, db);

// Grant points
await grantPointsToUser(points, userId, db);
```

## URL Shortening

```typescript
import { shortenLinksInBody } from '@lyku/route-helpers';

// Automatically shorten URLs in text content
const processedBody = await shortenLinksInBody(content, postId, authorId, db);
```

## Build

```bash
nx run @lyku/route-helpers:build
```

## Dependencies

- `@msgpack/msgpack` - For efficient binary serialization
- `kysely` - Type-safe SQL query builder
- `nats` - For pub/sub messaging
- `bun` - Runtime environment
- Other internal packages from the @lyku ecosystem
