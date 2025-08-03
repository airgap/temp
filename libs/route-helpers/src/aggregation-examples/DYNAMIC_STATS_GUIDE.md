# Dynamic Stats Storage in Elasticsearch Guide

This guide explains how to store and aggregate abstract/dynamic stat columns in Elasticsearch where every game has different statistics structures.

## Overview

Traditional leaderboards store fixed columns, but modern games need flexible stat tracking:

- **Speedrun games**: time, deaths, route, glitches_used
- **Puzzle games**: score, moves, time_bonus, difficulty
- **Racing games**: lap_time, top_speed, crashes, vehicle
- **Fighting games**: wins, losses, combo_max, character

Elasticsearch provides several strategies to handle this flexibility while maintaining performance.

## Storage Strategies

### 1. Flattened Object Storage (Recommended)

Store all stats in a flattened object that can handle any key-value pairs:

```json
{
	"id": "123",
	"user": "456",
	"game": 1,
	"stats": {
		"time": 263.45,
		"deaths": 3,
		"power_ups": 12,
		"route": "cloud_route",
		"glitchless": true
	}
}
```

**Pros:**

- Completely flexible schema
- Easy to query and aggregate
- Good performance for most use cases
- No mapping changes needed for new stats

**Cons:**

- Limited depth (20 levels by default)
- All values stored as strings internally

**Mapping:**

```json
{
	"stats": {
		"type": "flattened",
		"depth_limit": 20
	}
}
```

### 2. Typed Stats Buckets

Separate stats by type for better aggregation performance:

```json
{
	"typed_stats": {
		"numbers": {
			"time": 263.45,
			"deaths": 3,
			"power_ups": 12,
			"score": 95000
		},
		"strings": {
			"route": "cloud_route",
			"difficulty": "hard",
			"character": "ryu"
		},
		"times": {
			"lap_time": 92.34,
			"total_time": 263.45
		},
		"booleans": {
			"glitchless": true,
			"perfect_clear": false
		}
	}
}
```

**Pros:**

- Optimized aggregations by type
- Proper numeric operations
- Better storage efficiency

**Cons:**

- More complex queries
- Need to know stat types in advance

### 3. Nested Stats with Metadata

Store stats as nested objects with rich metadata:

```json
{
	"nested_stats": [
		{
			"name": "time",
			"value": 263.45,
			"type": "time",
			"unit": "seconds",
			"category": "performance"
		},
		{
			"name": "character",
			"value": "ryu",
			"type": "string",
			"category": "setup"
		}
	]
}
```

**Pros:**

- Rich metadata support
- Complex filtering capabilities
- Schema evolution support

**Cons:**

- More storage overhead
- Complex aggregation queries
- Slower performance for simple cases

## Implementation Examples

### Basic Setup

```typescript
// Define your game schema
const GAME_SCHEMAS: Record<number, StatColumn[]> = {
	1: [
		// Mario Speedrun
		{ name: 'time', type: 'time', unit: 'seconds', aggregatable: true },
		{ name: 'deaths', type: 'number', unit: 'count', aggregatable: true },
		{ name: 'route', type: 'string', aggregatable: false },
	],
	2: [
		// Puzzle Game
		{ name: 'score', type: 'number', unit: 'points', aggregatable: true },
		{ name: 'moves', type: 'number', unit: 'count', aggregatable: true },
		{ name: 'difficulty', type: 'string', aggregatable: false },
	],
};

// Index a score with dynamic stats
await ElasticLeaderboardService.indexScore({
	id: BigInt(123),
	user: BigInt(456),
	game: 1,
	leaderboard: BigInt(1),
	columns: ['4:23.45', '3', 'cloud_route'],
	// ... other fields
});
```

### Query Examples

#### 1. Simple Aggregation

```typescript
// Get average completion time for Mario speedruns
const avgTime = await ElasticLeaderboardService.aggregateOnStats(
	[BigInt(1)], // leaderboard IDs
	'time', // stat name
	'avg', // aggregation type
);

console.log(`Average time: ${avgTime.aggregation} seconds`);
```

#### 2. Grouped Aggregation

```typescript
// Get average score by difficulty level
const scoresByDifficulty = await ElasticLeaderboardService.aggregateOnStats(
	[BigInt(2)], // puzzle game leaderboard
	'score', // stat to aggregate
	'avg', // aggregation type
	{
		groupBy: 'difficulty', // group by difficulty
	},
);

scoresByDifficulty.buckets?.forEach((bucket) => {
	console.log(`${bucket.key}: ${bucket.value} points`);
});
```

#### 3. Complex Filtering

```typescript
// Find speedruns under 5 minutes with low deaths
const fastRuns = await ElasticLeaderboardService.aggregateOnStats([BigInt(1)], 'time', 'avg', {
	filters: {
		time: { lt: 300 }, // Under 5 minutes
		deaths: { lte: 5 }, // 5 or fewer deaths
		glitchless: true, // Glitchless runs only
	},
});
```

#### 4. Multi-Game Analysis

```typescript
// Compare performance across similar games
const builder = new DynamicStatsQueryBuilder()
	.filterByGames([1, 2, 3]) // Multiple Mario games
	.filterByStat('time', 'lt', 300)
	.aggregate('avg_time_by_game', 'time', 'avg', 'game')
	.aggregate('best_time', 'time', 'min');

const results = await builder.execute();
```

## Advanced Patterns

### 1. Schema Discovery

```typescript
// Discover available stats for a game
const stats = await ElasticLeaderboardService.getAvailableStats(1);
console.log(
	'Available stats:',
	stats.stats.map((s) => s.name),
);

// Output: ['time', 'deaths', 'power_ups', 'route', 'glitchless']
```

### 2. Dynamic Leaderboard Creation

```typescript
// Create leaderboard based on any stat
async function createStatLeaderboard(gameId: number, statName: string) {
	const query = {
		index: 'scores-*',
		body: {
			query: { term: { game: gameId } },
			sort: [{ [`stats.${statName}`]: { order: 'desc' } }],
			size: 50,
		},
	};

	return await elasticsearch.search(query);
}
```

### 3. Composite Scoring

```typescript
// Create composite scores from multiple stats
async function calculateSpeedrunScore(leaderboardId: bigint) {
	const query = {
		index: 'scores-*',
		body: {
			query: { term: { leaderboard: leaderboardId.toString() } },
			script_fields: {
				composite_score: {
					script: {
						source: `
              double timeScore = 1000 / Math.max(doc['stats.time'].value, 1);
              double deathPenalty = doc['stats.deaths'].value * 50;
              double powerUpBonus = doc['stats.power_ups'].value * 10;
              return timeScore - deathPenalty + powerUpBonus;
            `,
					},
				},
			},
		},
	};

	return await elasticsearch.search(query);
}
```

### 4. Real-time Analytics

```typescript
// Monitor stats for anomalies
async function detectAnomalies(gameId: number, statName: string) {
	const query = {
		index: 'scores-*',
		body: {
			query: { term: { game: gameId } },
			aggs: {
				stat_percentiles: {
					percentiles: {
						field: `stats.${statName}`,
						percents: [5, 95],
					},
				},
				recent_values: {
					filter: {
						range: {
							created: { gte: 'now-1h' },
						},
					},
					aggs: {
						values: {
							terms: { field: `stats.${statName}` },
						},
					},
				},
			},
		},
	};

	const result = await elasticsearch.search(query);
	// Compare recent values against historical percentiles
}
```

## Performance Optimization

### 1. Index Design

```json
{
	"settings": {
		"number_of_shards": 1,
		"number_of_replicas": 1,
		"refresh_interval": "5s"
	},
	"mappings": {
		"properties": {
			"stats": {
				"type": "flattened",
				"depth_limit": 20,
				"ignore_above": 8191
			},
			"typed_stats": {
				"properties": {
					"numbers": { "type": "flattened" },
					"strings": { "type": "flattened" },
					"times": { "type": "flattened" },
					"booleans": { "type": "flattened" }
				}
			}
		}
	}
}
```

### 2. Query Optimization

- Use specific field paths: `stats.time` instead of wildcard searches
- Leverage typed buckets for numeric aggregations
- Add filters before aggregations to reduce dataset size
- Use composite aggregations for pagination

### 3. Caching Strategy

```typescript
// Cache aggregation results based on complexity
const getCacheTTL = (queryComplexity: number): number => {
	if (queryComplexity > 1000) return 1800; // 30 minutes
	if (queryComplexity > 500) return 900; // 15 minutes
	return 300; // 5 minutes
};
```

## Common Use Cases

### 1. Speedrun.com Style Categories

```typescript
// Any% leaderboard sorted by time
const anyPercent = await createStatLeaderboard(1, 'time');

// 100% leaderboard with completion requirement
const hundredPercent = await ElasticLeaderboardService.aggregateOnStats([BigInt(1)], 'time', 'min', {
	filters: { completion_percentage: 100 },
});
```

### 2. Fighting Game Rankings

```typescript
// Win rate by character
const winRates = await ElasticLeaderboardService.aggregateOnStats(
	[BigInt(4)], // fighting game
	'wins',
	'avg',
	{ groupBy: 'character' },
);

// Find players with high combo averages
const comboMasters = await ElasticLeaderboardService.aggregateOnStats([BigInt(4)], 'combo_max', 'avg', {
	filters: { combo_max: { gte: 50 } },
});
```

### 3. Racing Game Analysis

```typescript
// Track performance by weather conditions
const weatherPerformance = await ElasticLeaderboardService.aggregateOnStats(
	[BigInt(3)], // racing game
	'lap_time',
	'avg',
	{ groupBy: 'weather' },
);

// Find consistent drivers (low crash rate, good times)
const consistentDrivers = await ElasticLeaderboardService.aggregateOnStats([BigInt(3)], 'total_time', 'avg', {
	filters: {
		crashes: { lte: 2 },
		total_time: { lt: 360 },
	},
});
```

## Migration Strategies

### From Fixed Schema to Dynamic

1. **Dual Write**: Write to both old and new formats during transition
2. **Background Migration**: Migrate historical data in batches
3. **Gradual Rollout**: Switch games one at a time

```typescript
// Migration example
async function migrateGameStats(gameId: number) {
	const oldScores = await getOldFormatScores(gameId);

	for (const score of oldScores) {
		const newStats = convertOldStatsToNew(score, gameId);
		await ElasticLeaderboardService.indexScore(newStats);
	}
}
```

### Schema Evolution

```typescript
// Handle schema changes gracefully
function processColumnValue(value: string, columnDef: StatColumn): any {
	if (columnDef.deprecated) {
		// Map deprecated fields to new ones
		return mapDeprecatedField(value, columnDef);
	}

	return parseValue(value, columnDef.type);
}
```

## Monitoring and Debugging

### 1. Query Performance

```typescript
// Monitor query performance
const startTime = Date.now();
const result = await ElasticLeaderboardService.aggregateOnStats(...);
const queryTime = Date.now() - startTime;

console.log(`Query took ${queryTime}ms`);
if (queryTime > 1000) {
  console.warn('Slow query detected');
}
```

### 2. Data Quality

```typescript
// Validate stat values
function validateStats(stats: Record<string, any>, gameSchema: StatColumn[]): boolean {
	for (const [name, value] of Object.entries(stats)) {
		const column = gameSchema.find((c) => c.name === name);
		if (!column) continue;

		if (!isValidValue(value, column.type)) {
			console.error(`Invalid ${column.type} value for ${name}: ${value}`);
			return false;
		}
	}
	return true;
}
```

### 3. Storage Usage

```typescript
// Monitor index size
async function getIndexStats() {
	const stats = await elasticsearch.indices.stats({
		index: 'scores-*',
		metric: ['store', 'docs'],
	});

	console.log('Index statistics:', stats.body._all.total);
}
```

## Best Practices

1. **Design for Query Patterns**: Structure data based on how you'll query it
2. **Use Appropriate Data Types**: Leverage typed buckets for numeric operations
3. **Index Only What You Need**: Mark non-aggregatable fields appropriately
4. **Monitor Performance**: Track query times and optimize slow queries
5. **Validate Input**: Ensure data quality at ingestion time
6. **Plan for Growth**: Design schemas that can evolve
7. **Cache Aggressively**: Cache expensive aggregations
8. **Use Aliases**: Enable zero-downtime migrations

This dynamic stats system gives you the flexibility to handle any game's statistics while maintaining high performance and query capabilities similar to speedrun.com and other modern leaderboard platforms.
