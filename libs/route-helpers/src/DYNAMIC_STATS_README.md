# Dynamic Stats Implementation for Multi-Game Leaderboards

This document explains the dynamic stats system implemented in `ElasticLeaderboardService` that allows storing and aggregating abstract stat columns across different games with varying schemas.

## Overview

The system provides three complementary storage strategies for handling dynamic game statistics:

1. **Flattened Object Storage** - For flexible key-value queries
2. **Typed Stats Buckets** - For optimized numeric aggregations
3. **Nested Stats with Metadata** - For rich querying with context

## Storage Strategies

### 1. Flattened Object Storage (`stats`)

```json
{
	"stats": {
		"time": 263.45,
		"deaths": 3,
		"power_ups": 12,
		"route": "cloud_route",
		"glitchless": true
	}
}
```

**Best for:**

- Simple key-value queries
- Cross-game stat comparisons
- Dynamic schema evolution

### 2. Typed Stats Buckets (`typed_stats`)

```json
{
	"typed_stats": {
		"numbers": {
			"time": 263.45,
			"deaths": 3,
			"power_ups": 12
		},
		"strings": {
			"route": "cloud_route",
			"difficulty": "hard"
		},
		"times": {
			"lap_time": 92.34
		},
		"booleans": {
			"glitchless": true
		}
	}
}
```

**Best for:**

- Type-specific aggregations
- Performance optimization
- Numeric operations

### 3. Nested Stats with Metadata (`nested_stats`)

```json
{
	"nested_stats": [
		{
			"name": "time",
			"value": 263.45,
			"type": "time",
			"unit": "seconds",
			"category": "performance"
		}
	]
}
```

**Best for:**

- Rich metadata queries
- Schema documentation
- Complex filtering

## Game Schema Configuration

Define schemas for each game to enable automatic column processing:

```typescript
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
```

## Usage Examples

### Basic Stats Aggregation

```typescript
// Get average completion time for Mario speedruns
const avgTime = await ElasticLeaderboardService.aggregateOnStats(
	[BigInt(1)], // leaderboard IDs
	'time', // stat name
	'avg', // aggregation type
);
```

### Grouped Aggregation

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
```

### Complex Filtering

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

### Cross-Game Analysis

```typescript
// Compare performance across multiple Mario games
const builder = new DynamicStatsQueryBuilder().filterByGames([1, 2, 3]).filterByStat('time', 'lt', 300).aggregate('avg_time_by_game', 'time', 'avg', 'game');

const results = await builder.execute();
```

## Data Processing Pipeline

### 1. Column Processing

```typescript
const { stats, typedStats, nestedStats } = processColumns(['4:23.45', '3', '12', 'cloud_route', 'true'], gameId);
```

### 2. Type Inference

- `4:23.45` → `time` (263.45 seconds)
- `3` → `number` (3)
- `true` → `boolean` (true)
- `cloud_route` → `string` ("cloud_route")

### 3. Storage Distribution

- Flattened: `{ time: 263.45, deaths: 3, ... }`
- Typed: `{ numbers: { deaths: 3 }, times: { time: 263.45 }, ... }`
- Nested: `[{ name: "time", value: 263.45, type: "time" }, ...]`

## Supported Game Types

### Speedrun Games

- **Stats**: time, deaths, power_ups, route, glitchless
- **Aggregations**: best time, average deaths, route analysis
- **Example**: Mario, Sonic, Zelda speedruns

### Puzzle Games

- **Stats**: score, moves, time_bonus, difficulty, perfect_clear
- **Aggregations**: high scores, move efficiency, difficulty trends
- **Example**: Tetris, Portal, puzzle platformers

### Racing Games

- **Stats**: lap_time, total_time, top_speed, crashes, vehicle, weather
- **Aggregations**: fastest laps, consistency analysis, vehicle performance
- **Example**: Mario Kart, F-Zero, Gran Turismo

### Fighting Games

- **Stats**: wins, losses, combo_max, damage_dealt, character, perfect_round
- **Aggregations**: win rates, character tier lists, combo analysis
- **Example**: Street Fighter, Tekken, Smash Bros

## API Reference

### Core Methods

#### `aggregateOnStats(leaderboardIds, statName, aggregationType, options)`

Aggregate any stat across leaderboards with filtering and grouping.

#### `getAvailableStats(gameId?, leaderboardId?)`

Discover what stats exist for games/leaderboards.

#### `getCrossGameLeaderboard(gameIds, options)`

Create cross-game rankings with points-based scoring.

#### `getUserCrossGameStats(userId, gameIds?)`

Get individual user performance across games.

### Query Builder

```typescript
const query = new DynamicStatsQueryBuilder().filterByGames([1, 2, 3]).filterByStat('time', 'lt', 300).filterByStat('deaths', 'lte', 5).aggregate('avg_time', 'time', 'avg').aggregate('best_time', 'time', 'min');
```

## Performance Considerations

### Indexing Strategy

- Monthly indices: `scores-YYYY-MM`
- Dynamic object mapping for flexible stats
- Nested field optimization for metadata queries

### Caching

- Simple queries: 5-10 minute TTL
- Complex aggregations: 15-30 minute TTL
- User-specific: 5 minute TTL
- Statistics: 1 hour TTL

### Query Optimization

- Use specific field paths: `stats.time`
- Leverage typed buckets for numeric aggregations
- Filter before aggregating to reduce dataset size
- Batch operations for bulk updates

## Migration Guide

### From Fixed Schema

1. **Dual Write**: Write to both old and new formats
2. **Background Migration**: Migrate historical data in batches
3. **Gradual Rollout**: Switch games one at a time

### Schema Evolution

```typescript
// Handle deprecated fields gracefully
function processColumnValue(value: string, columnDef: StatColumn): any {
	if (columnDef.deprecated) {
		return mapDeprecatedField(value, columnDef);
	}
	return parseValue(value, columnDef.type);
}
```

## Error Handling

### Data Validation

```typescript
function validateStats(stats: Record<string, any>, schema: StatColumn[]): boolean {
	for (const [name, value] of Object.entries(stats)) {
		const column = schema.find((c) => c.name === name);
		if (column && !isValidValue(value, column.type)) {
			console.error(`Invalid ${column.type} value for ${name}: ${value}`);
			return false;
		}
	}
	return true;
}
```

### Query Resilience

- All aggregation methods include comprehensive error handling
- Graceful degradation on Elasticsearch failures
- Empty result fallbacks prevent application crashes

## Testing

### Unit Tests

- Type inference validation
- Column processing accuracy
- Edge case handling
- Schema compatibility

### Integration Tests

- End-to-end score indexing
- Cross-game aggregation accuracy
- Performance under load
- Cache consistency

## Best Practices

1. **Design for Query Patterns** - Structure data based on how you'll query it
2. **Use Appropriate Types** - Leverage typed buckets for numeric operations
3. **Index Selectively** - Mark non-aggregatable fields appropriately
4. **Monitor Performance** - Track query times and optimize slow queries
5. **Validate Input** - Ensure data quality at ingestion time
6. **Plan for Growth** - Design schemas that can evolve
7. **Cache Strategically** - Cache expensive aggregations
8. **Document Schemas** - Maintain clear game stat documentation

This dynamic stats system provides the flexibility to handle any game's statistics while maintaining high performance and rich querying capabilities similar to speedrun.com and other modern leaderboard platforms.
