# Flexible Leaderboard Sorting

This document explains how to use the flexible column sorting feature in the ElasticLeaderboardService.

## Overview

The leaderboard service now supports sorting by any column in your game scores at runtime, without requiring index recreation or performance degradation.

## API Usage

### Basic Usage

```typescript
import { ElasticLeaderboardService } from '@lyku/route-helpers';

// Sort by first column (default behavior)
const result = await ElasticLeaderboardService.getLeaderboard(leaderboardId, {
	limit: 20,
	orderDirection: 'desc',
	columnFormat: 'number',
	sortColumnIndex: 0, // First column
});
```

### Flexible Column Sorting

```typescript
// Sort by second column (index 1)
const result = await ElasticLeaderboardService.getLeaderboard(leaderboardId, {
	limit: 20,
	orderDirection: 'asc',
	columnFormat: 'time',
	sortColumnIndex: 1, // Second column
});

// Sort by third column (index 2)
const result = await ElasticLeaderboardService.getLeaderboard(leaderboardId, {
	limit: 10,
	orderDirection: 'desc',
	columnFormat: 'text',
	sortColumnIndex: 2, // Third column
});
```

## HTTP API Usage

The `list-high-scores` route now accepts optional sorting parameters:

```bash
# Sort by first column (default)
GET /list-high-scores?leaderboard=123

# Sort by second column, ascending
GET /list-high-scores?leaderboard=123&sortColumnIndex=1&sortDirection=asc

# Sort by third column, descending
GET /list-high-scores?leaderboard=123&sortColumnIndex=2&sortDirection=desc
```

## Game Score Examples

### Racing Game

```typescript
// Columns: [lapTime, topSpeed, crashes]
const scores = [
  ["2:45.123", "180", "0"],    // Fast lap, high speed, no crashes
  ["3:12.456", "165", "2"],    // Slower lap, lower speed, some crashes
  ["2:58.789", "175", "1"]     // Medium lap, good speed, one crash
];

// Sort by lap time (fastest first)
sortColumnIndex: 0, columnFormat: 'time', orderDirection: 'asc'

// Sort by top speed (highest first)
sortColumnIndex: 1, columnFormat: 'number', orderDirection: 'desc'

// Sort by crashes (fewest first)
sortColumnIndex: 2, columnFormat: 'number', orderDirection: 'asc'
```

### Puzzle Game

```typescript
// Columns: [score, moves, timeSeconds]
const scores = [
  ["15000", "45", "120"],      // High score, many moves, long time
  ["18000", "32", "95"],       // Higher score, fewer moves, shorter time
  ["12000", "28", "180"]       // Lower score, very few moves, long time
];

// Sort by score (highest first)
sortColumnIndex: 0, columnFormat: 'number', orderDirection: 'desc'

// Sort by moves (fewest first) - efficiency ranking
sortColumnIndex: 1, columnFormat: 'number', orderDirection: 'asc'

// Sort by time (fastest first) - speed ranking
sortColumnIndex: 2, columnFormat: 'number', orderDirection: 'asc'
```

### Combat Game

```typescript
// Columns: [kills, deaths, playerName]
const scores = [
  ["25", "3", "PlayerOne"],    // High K/D ratio
  ["18", "12", "PlayerTwo"],   // Balanced stats
  ["30", "15", "PlayerThree"]  // High kills but many deaths
];

// Sort by kills (most first)
sortColumnIndex: 0, columnFormat: 'number', orderDirection: 'desc'

// Sort by deaths (fewest first) - survival ranking
sortColumnIndex: 1, columnFormat: 'number', orderDirection: 'asc'

// Sort by player name (alphabetical)
sortColumnIndex: 2, columnFormat: 'text', orderDirection: 'asc'
```

## Performance Characteristics

### Optimized Sorting (Column 0)

- **Performance**: ~50-100ms for 1000+ scores
- **Method**: Native Elasticsearch field sorting
- **Use Case**: Default/primary leaderboard view

### Flexible Sorting (Column 1+)

- **Performance**: ~100-300ms for 1000+ scores
- **Method**: Script-based sorting with caching
- **Use Case**: Alternative ranking views

### Caching Strategy

- Each column index is cached separately
- Cache TTL scales with query time:
  - Fast queries (< 500ms): 10 minute cache
  - Medium queries (500ms - 1s): 15 minute cache
  - Slow queries (> 1s): 30 minute cache

## Configuration

### Column Index Limits

- **Range**: 0-10 (configurable)
- **Validation**: Automatic bounds checking
- **Fallback**: Returns empty results for invalid indices

### Column Formats

- **`number`**: Numeric sorting (1, 2, 10, 100)
- **`text`**: Alphabetical sorting (A, B, C...)
- **`time`**: String-based time sorting (for formatted times)

## Error Handling

```typescript
try {
	const result = await ElasticLeaderboardService.getLeaderboard(leaderboardId, {
		sortColumnIndex: 15, // Invalid - exceeds limit of 10
	});
} catch (error) {
	// Error: Invalid sortColumnIndex: 15. Must be between 0 and 10.
}
```

## Migration from Fixed Sorting

### Before (Fixed First Column)

```typescript
const result = await ElasticLeaderboardService.getLeaderboard(leaderboardId, {
	orderDirection: 'desc',
	columnFormat: 'number',
});
```

### After (Flexible Column)

```typescript
const result = await ElasticLeaderboardService.getLeaderboard(leaderboardId, {
	orderDirection: 'desc',
	columnFormat: 'number',
	sortColumnIndex: 0, // Explicit first column (same behavior)
});
```

## Best Practices

1. **Use Column 0 for Primary Rankings**: Fastest performance
2. **Cache Aggressively**: Let Redis handle frequent requests
3. **Validate Column Indices**: Check bounds before querying
4. **Consider Column Formats**: Match format to data type for proper sorting
5. **Monitor Performance**: Log slow queries for optimization

## Implementation Notes

- Script-based sorting uses Elasticsearch's `_script` sort feature
- Column 0 uses optimized field-based sorting for best performance
- Bounds checking prevents array access errors in scripts
- Fallback values ensure graceful handling of missing data
- Redis caching minimizes Elasticsearch load for repeated requests
