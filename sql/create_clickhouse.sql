CREATE TABLE user_post_reactions
ON CLUSTER default
(
    postId   UInt64,
    userId   UInt64,
    reaction String,
    created  DateTime
)
ENGINE = MergeTree
ORDER BY (postId, userId);

CREATE TABLE post_reaction_counts
ON CLUSTER default
(
    postId   UInt64,
    reaction String,
    count    AggregateFunction(count, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (postId, reaction);

CREATE MATERIALIZED VIEW post_reaction_counts_mv
ON CLUSTER default
TO post_reaction_counts
AS
SELECT
    postId,
    argMax(reaction, created) AS reaction,
    countState() AS count
FROM user_post_reactions_raw
GROUP BY postId, userId;



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

