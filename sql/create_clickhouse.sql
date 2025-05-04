-- Store all user reactions (append-only)
CREATE TABLE user_post_reactions
ON CLUSTER default
(
    postId   UInt64,
    userId   UInt64,
    reaction String,
    created  DateTime64(3)  -- Using DateTime64 for microsecond precision
)
ENGINE = ReplacingMergeTree(created)
ORDER BY (userId, postId);

-- Materialized view to capture latest reaction per user per post
CREATE MATERIALIZED VIEW user_latest_reactions
ON CLUSTER default
(
    postId   UInt64,
    userId   UInt64,
    reaction String,
    created  DateTime64(3)
)
ENGINE = ReplacingMergeTree(created)
ORDER BY (userId, postId)
POPULATE
AS 
SELECT
    postId,
    userId,
    reaction,
    created
FROM user_post_reactions;

-- Aggregated reaction counts 
CREATE TABLE post_reaction_counts
ON CLUSTER default
(
    postId      UInt64,
    reaction    String,
    count       UInt64,
    updated_at  DateTime64(3)
)
ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (postId, reaction);

-- Materialized view to update counts
CREATE MATERIALIZED VIEW post_reaction_counts_mv
ON CLUSTER default
TO post_reaction_counts
AS
SELECT
    postId,
    reaction,
    count() AS count,
    now64(3) AS updated_at
FROM user_latest_reactions
GROUP BY postId, reaction;

-- Create a buffer table for Elasticsearch sync (optional)
CREATE TABLE post_reaction_counts_buffer
ON CLUSTER default
(
    postId      UInt64,
    reaction    String,
    count       UInt64,
    updated_at  DateTime64(3)
)
ENGINE = Buffer(default, post_reaction_counts, 16, 10, 100, 10000, 1000000, 10000000, 100000000);

-- Function to refresh counts for Elasticsearch export
CREATE FUNCTION refresh_reaction_counts_for_elasticsearch AS
    INSERT INTO post_reaction_counts_buffer
    SELECT * FROM post_reaction_counts;


CREATE TABLE user_point_grants
ON CLUSTER default
(
    reason   LowCardinality(String),
    userId   UInt64,
    key      String,
    points   AggregateFunction(argMax, UInt64, DateTime),
    created  AggregateFunction(min, DateTime),
    updated  AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY (reason, userId, key);



CREATE MATERIALIZED VIEW user_point_grants_mv
ON CLUSTER default
TO user_point_grants
AS
SELECT
    reason,
    userId,
    key,
    argMaxState(points, event_time) AS points,
    minState(event_time) AS created,
    maxState(event_time) AS updated
FROM user_point_grants_raw
GROUP BY reason, userId, key;



CREATE TABLE user_achievement_grants
ON CLUSTER default
(
    achievementId UInt64,
    userId        UInt64,
    progress      AggregateFunction(argMax, UInt32, DateTime),
    created       AggregateFunction(min, DateTime),
    updated       AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY (achievementId, userId);



CREATE MATERIALIZED VIEW user_achievement_grants_mv
ON CLUSTER default
TO user_achievement_grants
AS
SELECT
    achievementId,
    userId,
    argMaxState(progress, event_time) AS progress,
    minState(event_time) AS created,
    maxState(event_time) AS updated
FROM user_achievement_grants_raw
GROUP BY achievementId, userId;

