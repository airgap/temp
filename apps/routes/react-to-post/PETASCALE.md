# Petascale Reaction System Architecture

## Overview

This document explains the architecture and design decisions for handling post reactions at extreme scale (millions to billions of reactions). The system is specifically designed to handle viral posts with 40M+ reactions while maintaining performance, resource efficiency, and data consistency.

## Key Metrics and Constraints

- **Memory Efficiency**: Redis memory usage must be optimized
- **Response Time**: ≤50ms for 99th percentile reaction operations
- **Database Load**: Minimize PostgreSQL query volume and complexity
- **Data Consistency**: Ensure accurate reaction counts despite caching layers
- **Scalability**: No artificial ceiling on post popularity

## Two-Tier Processing Strategy

### Regular Posts (< 10,000 reactions)

- Full reaction data cached in Redis
- Direct read/write to Redis for all operations
- Complete user-reaction mappings stored
- Periodic reconciliation with PostgreSQL

### Viral Posts (≥ 10,000 reactions)

- Sampled data approach (1,000 most recent reactions cached)
- Aggregated counts stored for all reaction types
- Hybrid Redis+PostgreSQL operations when needed
- Special viral post flags to trigger optimized handling

## Redis Data Organization

### Sharding Strategy

Posts and user data are sharded based on modulo of IDs:

```
userShardId = userId % 100
postShardId = postId % 100
```

### Key Structure

- `post:{postShardId}:{postId}:reactions` - Hash mapping userId → reaction type
- `user:{userShardId}:{userId}:reactions` - Hash mapping postId → reaction type
- `post:{postShardId}:{postId}:reaction_counts` - Hash mapping reaction type → count
- `post:{postShardId}:{postId}:viral` - Flag indicating viral post status
- `post:{postShardId}:{postId}:total_reactions` - Total reaction count for viral posts

## Operation Flow

1. **Classification**: System determines if post is regular or viral
2. **Data Access**:
   - Regular: Direct Redis operations
   - Viral: Check cached sample first, fallback to DB if needed
3. **Counter Updates**: Atomic incrementing/decrementing of reaction counts
4. **Persistence**: Asynchronous PostgreSQL writes with retry queue
5. **Sample Management**: For viral posts, maintain most recent reactions in cache

## Optimization Techniques

### Memory Optimization

- Store only reaction counts and samples for viral posts instead of all reactions
- TTL on all Redis keys (24 hour default)
- Sharded keys to distribute memory load

### Performance Optimization

- Lua scripts for atomic multi-key operations
- Redis pipelining for batch operations
- Precomputed counts instead of set membership operations

### Database Load Optimization

- Sample-based caching reduces database queries by ~99% for viral posts
- Batch processing during reconciliation
- Counter-based architecture avoids costly aggregation queries

## Recovery and Reconciliation

### Redis Failure Recovery

- Regular posts: Rebuild full reaction data
- Viral posts: Rebuild aggregated counts and sample data only

### Periodic Reconciliation

- Scheduled job identifies post popularity and applies appropriate strategy
- Count verification ensures reaction totals match database
- Sample refresh ensures most recent reactions are cached

## Memory Usage Analysis

### Regular Post (1,000 reactions)

- ~50KB Redis memory usage

### Viral Post (40M reactions)

Without optimization:

- ~2GB Redis memory usage per post (prohibitive)

With petascale optimization:

- ~100KB Redis memory usage (99.99% reduction)
- ~1,000 sample reactions
- Aggregated counters

## Monitoring

Key metrics to monitor:

- Cache hit/miss rate for viral posts
- Ratio of regular:viral posts
- Redis memory usage per shard
- PostgreSQL query load from fallback operations
- Reconciliation job duration and frequency

## Future Optimizations

1. **Tiered TTL Strategy**: Different expiration for different popularity levels
2. **Probabilistic Data Structures**: Consider HyperLogLog for unique reaction counting
3. **Real-time Virality Detection**: Proactively identify and optimize for emerging viral content
