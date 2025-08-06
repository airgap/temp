# User Rank Functionality

This document describes the new user rank functionality added to the `ElasticLeaderboardService` that allows you to get a specific user's position in a leaderboard efficiently.

## Overview

The current `getLeaderboard` method only returns rankings for the top N users (limited by the `limit` parameter). If a user wants to know their rank but they're not in the top results, the original system couldn't provide this information.

The new functionality adds two methods to solve this:

1. `getUserRank()` - Get a specific user's rank and score
2. `getLeaderboardWithUserRank()` - Get both top scores AND a specific user's rank

## Methods

### getUserRank()

Gets a specific user's rank in a leaderboard without having to fetch all users above them.

```typescript
static async getUserRank(
    leaderboardId: bigint,
    userId: bigint,
    options?: {
        orderDirection?: 'asc' | 'desc';
        columnFormat?: 'number' | 'text' | 'time';
        sortColumnIndex?: number;
        framePoint?: string;
        frameSize?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    }
): Promise<{
    rank: number;
    score: any;
    total: number;
    user: bigint;
    created: string;
    columns: string[];
} | null>
```

**Returns:**

- `rank`: The user's position (1 = best)
- `score`: The user's best score value
- `total`: Total number of users in the leaderboard
- `user`: The user ID
- `created`: When the score was created
- `columns`: All column values for the score
- `null`: If user not found or has no scores

### getLeaderboardWithUserRank()

Gets both the top leaderboard results AND a specific user's rank, even if they're not in the top results.

```typescript
static async getLeaderboardWithUserRank(
    leaderboardId: bigint,
    userId: bigint,
    options?: {
        limit?: number;
        orderDirection?: 'asc' | 'desc';
        columnFormat?: 'number' | 'text' | 'time';
        sortColumnIndex?: number;
        framePoint?: string;
        frameSize?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    }
): Promise<{
    leaderboard: LeaderboardResult;
    userRank: {
        rank: number;
        score: any;
        total: number;
        user: bigint;
        created: string;
        columns: string[];
    } | null;
}>
```

## Usage Examples

### Example 1: Get User's Rank

```typescript
// Get user 12345's rank in leaderboard 1
const userRank = await ElasticLeaderboardService.getUserRank(1n, 12345n, {
	orderDirection: 'desc',
	columnFormat: 'number',
});

if (userRank) {
	console.log(`User ${userRank.user} is ranked #${userRank.rank} out of ${userRank.total} players`);
	console.log(`Their best score is ${userRank.score}`);
} else {
	console.log('User not found or has no scores');
}
```

### Example 2: Get Top 10 + User's Position

```typescript
// Get top 10 scores AND user 12345's rank (even if they're not in top 10)
const result = await ElasticLeaderboardService.getLeaderboardWithUserRank(
	1n, // leaderboard ID
	12345n, // user ID
	{
		limit: 10,
		orderDirection: 'desc',
		columnFormat: 'number',
	},
);

console.log('Top 10 scores:');
result.leaderboard.scores.forEach((score) => {
	console.log(`#${score.rank}: User ${score.user} - ${score.score}`);
});

if (result.userRank) {
	console.log(`\nYour rank: #${result.userRank.rank} with score ${result.userRank.score}`);

	if (result.userRank.rank <= 10) {
		console.log("You're in the top 10! 🏆");
	} else {
		console.log(`You need ${result.leaderboard.scores[9].score - result.userRank.score} more points to reach top 10`);
	}
}
```

### Example 3: Time-Frame Specific Ranks

```typescript
// Get user's rank for this week only
const weeklyRank = await ElasticLeaderboardService.getUserRank(1n, 12345n, {
	frameSize: 'week',
	orderDirection: 'desc',
});

// Get user's rank for a specific day
const dailyRank = await ElasticLeaderboardService.getUserRank(1n, 12345n, {
	frameSize: 'day',
	framePoint: '2024-01-15T00:00:00Z',
});
```

## Performance Characteristics

### Efficiency

- **getUserRank()**: Uses Elasticsearch cardinality aggregations to count users efficiently
- **getLeaderboardWithUserRank()**: Runs both queries in parallel for optimal performance
- **Caching**: Both methods use Redis caching with intelligent TTL based on query performance

### Complexity

- **Time Complexity**: O(1) for numeric scores using range queries
- **Space Complexity**: O(1) - doesn't load all user data into memory
- **Index Usage**: Leverages existing Elasticsearch indices efficiently

### Caching Strategy

- Cache keys include all relevant parameters (user, leaderboard, sorting options, time frame)
- TTL varies based on query performance: 600s (fast), 900s (medium), 1800s (slow)
- Proper cache isolation between different users and query parameters

## Limitations

### Text/Time Column Sorting

For non-numeric columns (text/time), the rank calculation is less efficient because:

- Elasticsearch range queries on text fields require the `.keyword` mapping
- String comparisons are inherently slower than numeric comparisons
- Consider using numeric representations for time-based scores when possible

### Large Datasets

- The cardinality aggregation is approximate for very large datasets (>40,000 unique users)
- For most gaming leaderboards, this approximation is acceptable and performs well
- Consider partitioning very large leaderboards by time periods for better performance

## Integration with Existing Code

The new methods are fully compatible with existing `getLeaderboard` functionality:

- Same parameter structure and validation
- Same caching strategy
- Same support for time frames, column sorting, and ordering

You can gradually migrate existing code or use the new methods alongside the original ones without conflicts.

## Error Handling

Both methods return `null` for the user rank portion when:

- User ID doesn't exist in the leaderboard
- User has no scores in the specified time frame
- Elasticsearch query fails (logged but doesn't throw)

The methods are designed to be resilient and won't break your application flow if a user lookup fails.
