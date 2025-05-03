CREATE TABLE user_post_reactions_toilet
(
    postId   UInt64,
    userId   UInt64,
    reaction AggregateFunction(argMax, String, DateTime),
    created  AggregateFunction(min, DateTime),
    updated  AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY (postId, userId)
ON CLUSTER default;


CREATE TABLE user_post_reactions_sewer
(
    postId   UInt64,
    userId   UInt64,
    reaction AggregateFunction(argMax, String, DateTime),
    created  AggregateFunction(min, DateTime),
    updated  AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY (postId, userId)
ON CLUSTER default;


CREATE TABLE user_point_grants_toilet
(
    reason   LowCardinality(String),
    userId   UInt64,
    key      String,
    points   AggregateFunction(argMax, UInt64, DateTime),
    created  AggregateFunction(min, DateTime),
    updated  AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY (reason, userId, key)
ON CLUSTER default;


CREATE TABLE user_point_grants_sewer
(
    reason   LowCardinality(String),
    userId   UInt64,
    key      String,
    points   AggregateFunction(argMax, UInt64, DateTime),
    created  AggregateFunction(min, DateTime),
    updated  AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY (reason, userId, key)
ON CLUSTER default;


CREATE TABLE user_achievement_grants_toilet
(
    achievementId UInt64,
    userId        UInt64,
    progress      AggregateFunction(argMax, UInt32, DateTime),
    created       AggregateFunction(min, DateTime),
    updated       AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY (achievementId, userId)
ON CLUSTER default;


CREATE TABLE user_achievement_grants_sewer
(
    achievementId UInt64,
    userId        UInt64,
    progress      AggregateFunction(argMax, UInt32, DateTime),
    created       AggregateFunction(min, DateTime),
    updated       AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY (achievementId, userId)
ON CLUSTER default;
