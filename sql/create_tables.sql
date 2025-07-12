-----------------------------
----  achievementGrants  ----
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "achievementGrants" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "achievement" BIGINT NOT NULL,
  "user" BIGINT NOT NULL,
  "granted" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "game" INTEGER,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_achievementGrants_user" ON "achievementGrants" ("user");


CREATE INDEX IF NOT EXISTS "idx_achievementGrants_granted" ON "achievementGrants" ("granted");


CREATE INDEX IF NOT EXISTS "idx_achievementGrants_achievement" ON "achievementGrants" ("achievement");


CREATE INDEX IF NOT EXISTS "idx_achievementGrants_game" ON "achievementGrants" ("game");
------------------------------
-------  achievements  -------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "achievements" (
  "description" TEXT,
  "id" BIGINT PRIMARY KEY NOT NULL,
  "icon" TEXT CHECK (length("icon") <= 100) CHECK (length("icon") >= 1) NOT NULL,
  "name" TEXT CHECK (length("name") <= 100) CHECK (length("name") >= 1) NOT NULL,
  "points" INTEGER NOT NULL,
  "tier" TEXT CHECK (
    "tier" IN ('tin', 'bronze', 'silver', 'gold', 'tritium')
  ),
  "game" INTEGER,
  "created" TIMESTAMPTZ NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_achievements_name" ON "achievements" ("name");


CREATE INDEX IF NOT EXISTS "idx_achievements_points" ON "achievements" ("points");


CREATE INDEX IF NOT EXISTS "idx_achievements_game" ON "achievements" ("game");


CREATE INDEX IF NOT EXISTS "idx_achievements_tier" ON "achievements" ("tier");


---- Create triggers
CREATE OR REPLACE FUNCTION achievements_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS achievements_trigger_1 ON "achievements";


CREATE TRIGGER achievements_trigger_1 BEFORE
UPDATE ON "achievements" FOR EACH ROW
EXECUTE FUNCTION achievements_trigger_1_fn ();
------------------------------
---------  btvStats  ---------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "btvStats" (
  "user" BIGINT PRIMARY KEY,
  "totalTime" DOUBLE PRECISION NOT NULL,
  "totalEdges" BIGINT CHECK ("totalEdges" >= 0) NOT NULL,
  "totalCorners" BIGINT CHECK ("totalCorners" >= 0) NOT NULL,
  "currentTime" DOUBLE PRECISION NOT NULL,
  "currentEdges" BIGINT CHECK ("currentEdges" >= 0) NOT NULL,
  "currentCorners" BIGINT CHECK ("currentCorners" >= 0) NOT NULL,
  "highestTime" DOUBLE PRECISION NOT NULL,
  "highestEdges" BIGINT CHECK ("highestEdges" >= 0) NOT NULL,
  "highestCorners" BIGINT CHECK ("highestCorners" >= 0) NOT NULL,
  "sessionCount" BIGINT CHECK ("sessionCount" >= 0) NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  PRIMARY KEY ("user")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_btvStats_user" ON "btvStats" ("user");


CREATE INDEX IF NOT EXISTS "idx_btvStats_totalTime" ON "btvStats" ("totalTime");


CREATE INDEX IF NOT EXISTS "idx_btvStats_totalEdges" ON "btvStats" ("totalEdges");


CREATE INDEX IF NOT EXISTS "idx_btvStats_totalCorners" ON "btvStats" ("totalCorners");


CREATE INDEX IF NOT EXISTS "idx_btvStats_highestTime" ON "btvStats" ("highestTime");


CREATE INDEX IF NOT EXISTS "idx_btvStats_highestEdges" ON "btvStats" ("highestEdges");


CREATE INDEX IF NOT EXISTS "idx_btvStats_highestCorners" ON "btvStats" ("highestCorners");


CREATE INDEX IF NOT EXISTS "idx_btvStats_sessionCount" ON "btvStats" ("sessionCount");


CREATE INDEX IF NOT EXISTS "idx_btvStats_currentCorners" ON "btvStats" ("currentCorners");


CREATE INDEX IF NOT EXISTS "idx_btvStats_currentEdges" ON "btvStats" ("currentEdges");


CREATE INDEX IF NOT EXISTS "idx_btvStats_currentTime" ON "btvStats" ("currentTime");


---- Create triggers
CREATE OR REPLACE FUNCTION btvStats_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS btvStats_trigger_1 ON "btvStats";


CREATE TRIGGER btvStats_trigger_1 BEFORE
UPDATE ON "btvStats" FOR EACH ROW
EXECUTE FUNCTION btvStats_trigger_1_fn ();
-----------------------------
----  channelSensitives  ----
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "channelSensitives" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "owner" BIGINT NOT NULL,
  "inputId" TEXT NOT NULL,
  "rtmpsKey" TEXT NOT NULL,
  "srtUrl" TEXT NOT NULL,
  "whipUrl" TEXT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_channelSensitives_owner" ON "channelSensitives" ("owner");


CREATE INDEX IF NOT EXISTS "idx_channelSensitives_created" ON "channelSensitives" ("created");


CREATE INDEX IF NOT EXISTS "idx_channelSensitives_updated" ON "channelSensitives" ("updated");


---- Create triggers
CREATE OR REPLACE FUNCTION channelSensitives_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS channelSensitives_trigger_1 ON "channelSensitives";


CREATE TRIGGER channelSensitives_trigger_1 BEFORE
UPDATE ON "channelSensitives" FOR EACH ROW
EXECUTE FUNCTION channelSensitives_trigger_1_fn ();
------------------------------
---------  channels  ---------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "channels" (
  "live" BOOLEAN NOT NULL,
  "fgColor" CHAR(6),
  "bgColor" CHAR(6),
  "tvColor" CHAR(6),
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "owner" BIGINT NOT NULL,
  "logo" VARCHAR CHECK (length("logo") <= 50) CHECK (length("logo") >= 5),
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "name" VARCHAR CHECK (length("name") <= 30) CHECK (length("name") >= 3) NOT NULL,
  "slug" VARCHAR CHECK (length("slug") <= 30) CHECK (length("slug") >= 3) NOT NULL,
  "tagline" VARCHAR CHECK (length("tagline") <= 255),
  "bio" VARCHAR CHECK (length("bio") <= 1024),
  "activeBg" VARCHAR CHECK (length("activeBg") <= 50) CHECK (length("activeBg") >= 5),
  "awayBg" VARCHAR CHECK (length("awayBg") <= 50) CHECK (length("awayBg") >= 5),
  "totalStreamTime" DOUBLE PRECISION,
  "whepKey" VARCHAR CHECK (length("whepKey") <= 50) CHECK (length("whepKey") >= 5),
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_channels_name" ON "channels" ("name");


CREATE INDEX IF NOT EXISTS "idx_channels_slug" ON "channels" ("slug");


CREATE INDEX IF NOT EXISTS "idx_channels_owner" ON "channels" ("owner");


CREATE INDEX IF NOT EXISTS "idx_channels_totalStreamTime" ON "channels" ("totalStreamTime");


CREATE INDEX IF NOT EXISTS "idx_channels_live" ON "channels" ("live");


CREATE INDEX IF NOT EXISTS "idx_channels_created" ON "channels" ("created");


---- Create triggers
CREATE OR REPLACE FUNCTION channels_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS channels_trigger_1 ON "channels";


CREATE TRIGGER channels_trigger_1 BEFORE
UPDATE ON "channels" FOR EACH ROW
EXECUTE FUNCTION channels_trigger_1_fn ();
------------------------------
--------  developers  --------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "developers" (
  "id" INTEGER PRIMARY KEY NOT NULL,
  "homepage" TEXT NOT NULL,
  "name" TEXT CHECK (length("name") <= 100) NOT NULL,
  "thumbnail" TEXT,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_developers_name" ON "developers" ("name");


CREATE INDEX IF NOT EXISTS "idx_developers_homepage" ON "developers" ("homepage");


CREATE INDEX IF NOT EXISTS "idx_developers_updated" ON "developers" ("updated");


CREATE INDEX IF NOT EXISTS "idx_developers_created" ON "developers" ("created");


---- Create triggers
CREATE OR REPLACE FUNCTION developers_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS developers_trigger_1 ON "developers";


CREATE TRIGGER developers_trigger_1 BEFORE
UPDATE ON "developers" FOR EACH ROW
EXECUTE FUNCTION developers_trigger_1_fn ();
------------------------------
--------  fileDrafts  --------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "fileDrafts" (
  "creator" BIGINT NOT NULL,
  "post" BIGINT,
  "id" BIGINT NOT NULL,
  "uploadURL" TEXT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "filename" TEXT CHECK (length("filename") <= 100),
  "type" TEXT CHECK (length("type") <= 100) NOT NULL,
  "host" TEXT CHECK (length("host") <= 100) NOT NULL,
  "size" DOUBLE PRECISION,
  "width" INTEGER,
  "height" INTEGER,
  "length" DOUBLE PRECISION,
  "hostId" TEXT CHECK (length("hostId") <= 100) NOT NULL,
  "reason" TEXT CHECK (length("reason") <= 25),
  "supertype" TEXT CHECK (length("supertype") <= 10),
  PRIMARY KEY ("id")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_fileDrafts_creator" ON "fileDrafts" ("creator");


CREATE INDEX IF NOT EXISTS "idx_fileDrafts_type" ON "fileDrafts" ("type");


CREATE INDEX IF NOT EXISTS "idx_fileDrafts_post" ON "fileDrafts" ("post");


CREATE INDEX IF NOT EXISTS "idx_fileDrafts_created" ON "fileDrafts" ("created");


CREATE INDEX IF NOT EXISTS "idx_fileDrafts_creator" ON "fileDrafts" ("creator");
-----------------------------
----------  files  ----------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "files" (
  "id" BIGINT NOT NULL,
  "duration" DOUBLE PRECISION,
  "hostId" TEXT CHECK (length("hostId") <= 100) NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "modified" TIMESTAMPTZ,
  "size" INTEGER,
  "status" TEXT NOT NULL,
  "thumbnail" TEXT,
  "creator" BIGINT NOT NULL,
  "post" BIGINT,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  "type" TEXT CHECK (length("type") <= 100) NOT NULL,
  "host" TEXT CHECK (length("host") <= 100) NOT NULL,
  "reason" TEXT CHECK (length("reason") <= 25),
  PRIMARY KEY ("id")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_files_creator" ON "files" ("creator");


CREATE INDEX IF NOT EXISTS "idx_files_id" ON "files" ("id");


CREATE INDEX IF NOT EXISTS "idx_files_post" ON "files" ("post");
-----------------------------
-------  friendLists  -------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "friendLists" (
  "user" BIGINT PRIMARY KEY NOT NULL,
  "friends" BIGINT[] NOT NULL,
  "count" INTEGER NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  PRIMARY KEY ("user")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_friendLists_user" ON "friendLists" ("user");


CREATE INDEX IF NOT EXISTS "idx_friendLists_friends" ON "friendLists" ("friends");


CREATE INDEX IF NOT EXISTS "idx_friendLists_count" ON "friendLists" ("count");


CREATE INDEX IF NOT EXISTS "idx_friendLists_created" ON "friendLists" ("created");


CREATE INDEX IF NOT EXISTS "idx_friendLists_updated" ON "friendLists" ("updated");


---- Create triggers
CREATE OR REPLACE FUNCTION friendLists_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS friendLists_trigger_1 ON "friendLists";


CREATE TRIGGER friendLists_trigger_1 BEFORE
UPDATE ON "friendLists" FOR EACH ROW
EXECUTE FUNCTION friendLists_trigger_1_fn ();
------------------------------
------  friendRequests  ------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "friendRequests" (
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "from" BIGINT NOT NULL,
  "id" TEXT PRIMARY KEY NOT NULL,
  "to" BIGINT NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_friendRequests_from" ON "friendRequests" ("from");


CREATE INDEX IF NOT EXISTS "idx_friendRequests_to" ON "friendRequests" ("to");


CREATE INDEX IF NOT EXISTS "idx_friendRequests_created" ON "friendRequests" ("created");


---- Create triggers
CREATE OR REPLACE FUNCTION friendRequests_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS friendRequests_trigger_1 ON "friendRequests";


CREATE TRIGGER friendRequests_trigger_1 BEFORE
UPDATE ON "friendRequests" FOR EACH ROW
EXECUTE FUNCTION friendRequests_trigger_1_fn ();
-----------------------------
-------  friendships  -------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "friendships" (
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "id" TEXT PRIMARY KEY NOT NULL,
  "users" BIGINT[] CHECK (array_length("users", 1) >= 2) CHECK (array_length("users", 1) <= 2) NOT NULL,
  "deleted" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_friendships_users" ON "friendships" ("users");


CREATE INDEX IF NOT EXISTS "idx_friendships_created" ON "friendships" ("created");
-----------------------------
----------  games  ----------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "games" (
  "background" TEXT,
  "developer" INTEGER NOT NULL,
  "homepage" TEXT,
  "icon" TEXT,
  "id" SERIAL PRIMARY KEY UNIQUE NOT NULL,
  "slug" TEXT UNIQUE,
  "publisher" INTEGER,
  "thumbnail" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT CHECK (
    "status" IN ('ga', 'wip', 'maintenance', 'ea', 'planned')
  ) NOT NULL,
  "nsfw" BOOLEAN NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_games_developer" ON "games" ("developer");


CREATE INDEX IF NOT EXISTS "idx_games_publisher" ON "games" ("publisher");


CREATE INDEX IF NOT EXISTS "idx_games_title" ON "games" ("title");


CREATE INDEX IF NOT EXISTS "idx_games_created" ON "games" ("created");


CREATE INDEX IF NOT EXISTS "idx_games_updated" ON "games" ("updated");


---- Create triggers
CREATE OR REPLACE FUNCTION games_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS games_trigger_1 ON "games";


CREATE TRIGGER games_trigger_1 BEFORE
UPDATE ON "games" FOR EACH ROW
EXECUTE FUNCTION games_trigger_1_fn ();
------------------------------
-----  groupMemberships  -----
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "groupMemberships" (
  "group" BIGINT NOT NULL,
  "user" BIGINT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("group", "user")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_groupMemberships_user" ON "groupMemberships" ("user");


CREATE INDEX IF NOT EXISTS "idx_groupMemberships_group" ON "groupMemberships" ("group");


CREATE INDEX IF NOT EXISTS "idx_groupMemberships_user_group" ON "groupMemberships" ("user", "group");


---- Create triggers
CREATE OR REPLACE FUNCTION groupMemberships_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS groupMemberships_trigger_1 ON "groupMemberships";


CREATE TRIGGER groupMemberships_trigger_1 BEFORE
UPDATE ON "groupMemberships" FOR EACH ROW
EXECUTE FUNCTION groupMemberships_trigger_1_fn ();
------------------------------
----------  groups  ----------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "groups" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "slug" VARCHAR CHECK (length("slug") <= 20) NOT NULL,
  "lowerSlug" VARCHAR CHECK (length("lowerSlug") <= 20) NOT NULL,
  "name" VARCHAR CHECK (length("name") <= 30) NOT NULL,
  "creator" BIGINT NOT NULL,
  "owner" BIGINT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "private" BOOLEAN NOT NULL,
  "thumbnail" VARCHAR CHECK (length("thumbnail") <= 30),
  "background" VARCHAR CHECK (length("background") <= 30),
  "updated" TIMESTAMPTZ,
  "members" BIGINT NOT NULL,
  "isolated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_groups_name" ON "groups" ("name");


CREATE INDEX IF NOT EXISTS "idx_groups_owner" ON "groups" ("owner");


CREATE INDEX IF NOT EXISTS "idx_groups_creator" ON "groups" ("creator");


CREATE INDEX IF NOT EXISTS "idx_groups_created" ON "groups" ("created");


CREATE INDEX IF NOT EXISTS "idx_groups_private" ON "groups" ("private");


CREATE INDEX IF NOT EXISTS "idx_groups_updated" ON "groups" ("updated");


---- Create triggers
CREATE OR REPLACE FUNCTION groups_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS groups_trigger_1 ON "groups";


CREATE TRIGGER groups_trigger_1 BEFORE
UPDATE ON "groups" FOR EACH ROW
EXECUTE FUNCTION groups_trigger_1_fn ();
-----------------------------
------  hashtagUsages  ------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "hashtagUsages" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "hashtag" BIGINT NOT NULL,
  "post" BIGINT NOT NULL,
  "group" BIGINT,
  "originalText" TEXT NOT NULL,
  "lowerText" TEXT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "author" BIGINT NOT NULL
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_hashtagUsages_id" ON "hashtagUsages" ("id");


CREATE INDEX IF NOT EXISTS "idx_hashtagUsages_hashtag" ON "hashtagUsages" ("hashtag");


CREATE INDEX IF NOT EXISTS "idx_hashtagUsages_lowerText" ON "hashtagUsages" ("lowerText");


CREATE INDEX IF NOT EXISTS "idx_hashtagUsages_originalText" ON "hashtagUsages" ("originalText");


CREATE INDEX IF NOT EXISTS "idx_hashtagUsages_author" ON "hashtagUsages" ("author");


CREATE INDEX IF NOT EXISTS "idx_hashtagUsages_created" ON "hashtagUsages" ("created");


CREATE INDEX IF NOT EXISTS "idx_hashtagUsages_group" ON "hashtagUsages" ("group");
------------------------------
---------  hashtags  ---------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "hashtags" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "lowerText" TEXT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  "usages" BIGINT NOT NULL
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_hashtags_id" ON "hashtags" ("id");


CREATE INDEX IF NOT EXISTS "idx_hashtags_lowerText" ON "hashtags" ("lowerText");


CREATE INDEX IF NOT EXISTS "idx_hashtags_created" ON "hashtags" ("created");


CREATE INDEX IF NOT EXISTS "idx_hashtags_updated" ON "hashtags" ("updated");


CREATE INDEX IF NOT EXISTS "idx_hashtags_usages" ON "hashtags" ("usages");


---- Create triggers
CREATE OR REPLACE FUNCTION hashtags_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS hashtags_trigger_1 ON "hashtags";


CREATE TRIGGER hashtags_trigger_1 BEFORE
UPDATE ON "hashtags" FOR EACH ROW
EXECUTE FUNCTION hashtags_trigger_1_fn ();
------------------------------
-------  leaderboards  -------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "leaderboards" (
  "game" BIGINT NOT NULL,
  "owner" BIGINT NOT NULL,
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "creator" BIGINT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ NOT NULL
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_leaderboards_game" ON "leaderboards" ("game");


CREATE INDEX IF NOT EXISTS "idx_leaderboards_owner" ON "leaderboards" ("owner");


CREATE INDEX IF NOT EXISTS "idx_leaderboards_created" ON "leaderboards" ("created");


CREATE INDEX IF NOT EXISTS "idx_leaderboards_updated" ON "leaderboards" ("updated");


CREATE INDEX IF NOT EXISTS "idx_leaderboards_creator" ON "leaderboards" ("creator");


---- Create triggers
CREATE OR REPLACE FUNCTION leaderboards_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS leaderboards_trigger_1 ON "leaderboards";


CREATE TRIGGER leaderboards_trigger_1 BEFORE
UPDATE ON "leaderboards" FOR EACH ROW
EXECUTE FUNCTION leaderboards_trigger_1_fn ();
-----------------------------
----------  likes  ----------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "likes" (
  "userId" BIGINT NOT NULL,
  "postId" BIGINT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("userId", "postId")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_likes_userId" ON "likes" ("userId");


CREATE INDEX IF NOT EXISTS "idx_likes_postId" ON "likes" ("postId");


CREATE INDEX IF NOT EXISTS "idx_likes_userId_postId" ON "likes" ("userId", "postId");


CREATE INDEX IF NOT EXISTS "idx_likes_created" ON "likes" ("created");
------------------------------
----------  logins  ----------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "logins" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "userId" BIGINT NOT NULL,
  "ip" TEXT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_logins_created" ON "logins" ("created");


CREATE INDEX IF NOT EXISTS "idx_logins_userId" ON "logins" ("userId");
------------------------------
------  matchProposals  ------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "matchProposals" (
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "from" BIGINT NOT NULL,
  "game" INTEGER NOT NULL,
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "to" BIGINT NOT NULL,
  "status" TEXT CHECK ("status" IN ('pending', 'accepted', 'rejected')) NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_matchProposals_from" ON "matchProposals" ("from");


CREATE INDEX IF NOT EXISTS "idx_matchProposals_to" ON "matchProposals" ("to");


CREATE INDEX IF NOT EXISTS "idx_matchProposals_created" ON "matchProposals" ("created");
-----------------------------
-----  membershipLists  -----
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "membershipLists" (
  "user" BIGINT PRIMARY KEY NOT NULL,
  "groups" BIGINT[] NOT NULL,
  "count" INTEGER NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("user")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_membershipLists_user" ON "membershipLists" ("user");


CREATE INDEX IF NOT EXISTS "idx_membershipLists_groups" ON "membershipLists" ("groups");


CREATE INDEX IF NOT EXISTS "idx_membershipLists_count" ON "membershipLists" ("count");


CREATE INDEX IF NOT EXISTS "idx_membershipLists_updated" ON "membershipLists" ("updated");


---- Create triggers
CREATE OR REPLACE FUNCTION membershipLists_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS membershipLists_trigger_1 ON "membershipLists";


CREATE TRIGGER membershipLists_trigger_1 BEFORE
UPDATE ON "membershipLists" FOR EACH ROW
EXECUTE FUNCTION membershipLists_trigger_1_fn ();
------------------------------
---------  messages  ---------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "messages" (
  "author" BIGINT NOT NULL,
  "content" VARCHAR CHECK (length("content") <= 300) CHECK (length("content") >= 1) NOT NULL,
  "channel" BIGINT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_messages_author" ON "messages" ("author");


CREATE INDEX IF NOT EXISTS "idx_messages_channel" ON "messages" ("channel");


CREATE INDEX IF NOT EXISTS "idx_messages_created" ON "messages" ("created");


---- Create triggers
CREATE OR REPLACE FUNCTION messages_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS messages_trigger_1 ON "messages";


CREATE TRIGGER messages_trigger_1 BEFORE
UPDATE ON "messages" FOR EACH ROW
EXECUTE FUNCTION messages_trigger_1_fn ();
-----------------------------
------  notifications  ------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user" BIGINT NOT NULL,
  "title" VARCHAR CHECK (length("title") <= 50) CHECK (length("title") >= 5) NOT NULL,
  "subtitle" VARCHAR CHECK (length("subtitle") <= 50) CHECK (length("subtitle") >= 5),
  "body" TEXT CHECK (length("body") <= 1000) NOT NULL,
  "icon" VARCHAR CHECK (length("icon") <= 50) CHECK (length("icon") >= 5) NOT NULL,
  "href" VARCHAR CHECK (length("href") <= 50) CHECK (length("href") >= 5),
  "posted" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "read" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON "notifications" ("user");


CREATE INDEX IF NOT EXISTS "idx_notifications_title" ON "notifications" ("title");


CREATE INDEX IF NOT EXISTS "idx_notifications_subtitle" ON "notifications" ("subtitle");


CREATE INDEX IF NOT EXISTS "idx_notifications_body" ON "notifications" ("body");


CREATE INDEX IF NOT EXISTS "idx_notifications_icon" ON "notifications" ("icon");


CREATE INDEX IF NOT EXISTS "idx_notifications_href" ON "notifications" ("href");


CREATE INDEX IF NOT EXISTS "idx_notifications_posted" ON "notifications" ("posted");


---- Create triggers
CREATE OR REPLACE FUNCTION notifications_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS notifications_trigger_1 ON "notifications";


CREATE TRIGGER notifications_trigger_1 BEFORE
UPDATE ON "notifications" FOR EACH ROW
EXECUTE FUNCTION notifications_trigger_1_fn ();
-----------------------------
--------  pfpDrafts  --------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "pfpDrafts" (
  "creator" BIGINT NOT NULL,
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  "uploadURL" TEXT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "filename" TEXT CHECK (length("filename") <= 100),
  "type" TEXT CHECK (length("type") <= 100),
  "size" DOUBLE PRECISION,
  "width" INTEGER,
  "height" INTEGER,
  "hostId" TEXT CHECK (length("hostId") <= 100) NOT NULL,
  PRIMARY KEY ("id")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_pfpDrafts_creator" ON "pfpDrafts" ("creator");


CREATE INDEX IF NOT EXISTS "idx_pfpDrafts_type" ON "pfpDrafts" ("type");


CREATE INDEX IF NOT EXISTS "idx_pfpDrafts_created" ON "pfpDrafts" ("created");


CREATE INDEX IF NOT EXISTS "idx_pfpDrafts_creator" ON "pfpDrafts" ("creator");
------------------------------
--------  postDrafts  --------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "postDrafts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "author" BIGINT NOT NULL,
  "body" TEXT CHECK (length("body") <= 1337) CHECK (length("body") >= 1),
  "replyTo" BIGINT,
  "echoing" BIGINT,
  "attachments" BIGINT[],
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_postDrafts_author" ON "postDrafts" ("author");


---- Create triggers
CREATE OR REPLACE FUNCTION postDrafts_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS postDrafts_trigger_1 ON "postDrafts";


CREATE TRIGGER postDrafts_trigger_1 BEFORE
UPDATE ON "postDrafts" FOR EACH ROW
EXECUTE FUNCTION postDrafts_trigger_1_fn ();
-----------------------------
----------  posts  ----------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "posts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "body" TEXT CHECK (length("body") <= 1337) CHECK (length("body") >= 1),
  "bodyType" TEXT CHECK ("bodyType" IN ('plaintext', 'markdown')),
  "echoes" BIGINT NOT NULL,
  "group" BIGINT,
  "hashtags" BIGINT[],
  "author" BIGINT NOT NULL,
  "likes" BIGINT NOT NULL,
  "loves" BIGINT,
  "publish" TIMESTAMPTZ NOT NULL,
  "replies" BIGINT NOT NULL,
  "title" VARCHAR CHECK (length("title") <= 100) CHECK (length("title") >= 1),
  "thread" BIGINT[],
  "shortcode" VARCHAR CHECK (length("shortcode") <= 22),
  "replyTo" BIGINT,
  "echoing" BIGINT,
  "attachments" BIGINT[] CHECK (array_length("attachments", 1) <= 256),
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  "deleted" TIMESTAMPTZ,
  "ogImage" TEXT CHECK (length("ogImage") <= 200)
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_posts_publish" ON "posts" ("publish");


CREATE INDEX IF NOT EXISTS "idx_posts_author" ON "posts" ("author");


CREATE INDEX IF NOT EXISTS "idx_posts_likes" ON "posts" ("likes");


CREATE INDEX IF NOT EXISTS "idx_posts_loves" ON "posts" ("loves");


CREATE INDEX IF NOT EXISTS "idx_posts_group" ON "posts" ("group");


CREATE INDEX IF NOT EXISTS "idx_posts_author" ON "posts" ("author");


CREATE INDEX IF NOT EXISTS "idx_posts_replyTo" ON "posts" ("replyTo");


CREATE INDEX IF NOT EXISTS "idx_posts_echoing" ON "posts" ("echoing");


CREATE INDEX IF NOT EXISTS "idx_posts_echoes" ON "posts" ("echoes");


---- Create triggers
CREATE OR REPLACE FUNCTION posts_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS posts_trigger_1 ON "posts";


CREATE TRIGGER posts_trigger_1 BEFORE
UPDATE ON "posts" FOR EACH ROW
EXECUTE FUNCTION posts_trigger_1_fn ();
------------------------------
--------  publishers  --------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "publishers" (
  "id" INTEGER PRIMARY KEY NOT NULL,
  "homepage" TEXT CHECK (length("homepage") <= 50) CHECK (length("homepage") >= 1) NOT NULL,
  "name" TEXT CHECK (length("name") <= 50) CHECK (length("name") >= 1) NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_publishers_name" ON "publishers" ("name");


---- Create triggers
CREATE OR REPLACE FUNCTION publishers_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS publishers_trigger_1 ON "publishers";


CREATE TRIGGER publishers_trigger_1 BEFORE
UPDATE ON "publishers" FOR EACH ROW
EXECUTE FUNCTION publishers_trigger_1_fn ();
-----------------------------
--------  reactions  --------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "reactions" (
  "userId" BIGINT NOT NULL,
  "postId" BIGINT NOT NULL,
  "created" TIMESTAMPTZ NOT NULL,
  "updated" TIMESTAMPTZ,
  "type" TEXT NOT NULL,
  UNIQUE ("userId", "postId")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_reactions_userId" ON "reactions" ("userId");


CREATE INDEX IF NOT EXISTS "idx_reactions_postId" ON "reactions" ("postId");
------------------------------
----------  scores  ----------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "scores" (
  "id" BIGSERIAL PRIMARY KEY,
  "posted" TIMESTAMPTZ NOT NULL,
  "user" BIGINT NOT NULL,
  "channel" BIGINT NOT NULL,
  "reports" INTEGER NOT NULL,
  "columns" BIGINT[] NOT NULL,
  "leaderboard" BIGINT NOT NULL,
  "game" BIGINT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ NOT NULL,
  "deleted" TIMESTAMPTZ,
  "verified" TIMESTAMPTZ,
  "verifiers" BIGINT[],
  "stream" TEXT CHECK (length("stream") <= 100)
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_scores_posted" ON "scores" ("posted");


CREATE INDEX IF NOT EXISTS "idx_scores_user" ON "scores" ("user");


CREATE INDEX IF NOT EXISTS "idx_scores_channel" ON "scores" ("channel");


CREATE INDEX IF NOT EXISTS "idx_scores_reports" ON "scores" ("reports");


CREATE INDEX IF NOT EXISTS "idx_scores_columns" ON "scores" ("columns");


CREATE INDEX IF NOT EXISTS "idx_scores_leaderboard" ON "scores" ("leaderboard");


CREATE INDEX IF NOT EXISTS "idx_scores_game" ON "scores" ("game");


---- Create triggers
CREATE OR REPLACE FUNCTION scores_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS scores_trigger_1 ON "scores";


CREATE TRIGGER scores_trigger_1 BEFORE
UPDATE ON "scores" FOR EACH ROW
EXECUTE FUNCTION scores_trigger_1_fn ();
------------------------------
---------  sessions  ---------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" CHAR(44) PRIMARY KEY NOT NULL,
  "userId" BIGINT NOT NULL,
  "ip" TEXT NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  "expiration" TIMESTAMPTZ NOT NULL
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_sessions_created" ON "sessions" ("created");


CREATE INDEX IF NOT EXISTS "idx_sessions_userId" ON "sessions" ("userId");


---- Create triggers
CREATE OR REPLACE FUNCTION sessions_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS sessions_trigger_1 ON "sessions";


CREATE TRIGGER sessions_trigger_1 BEFORE
UPDATE ON "sessions" FOR EACH ROW
EXECUTE FUNCTION sessions_trigger_1_fn ();
------------------------------
--------  shortlinks  --------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "shortlinks" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "url" TEXT CHECK (length("url") <= 255) NOT NULL,
  "author" BIGINT,
  "post" BIGINT,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_shortlinks_url" ON "shortlinks" ("url");


CREATE INDEX IF NOT EXISTS "idx_shortlinks_author" ON "shortlinks" ("author");


CREATE INDEX IF NOT EXISTS "idx_shortlinks_post" ON "shortlinks" ("post");


---- Create triggers
CREATE OR REPLACE FUNCTION shortlinks_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS shortlinks_trigger_1 ON "shortlinks";


CREATE TRIGGER shortlinks_trigger_1 BEFORE
UPDATE ON "shortlinks" FOR EACH ROW
EXECUTE FUNCTION shortlinks_trigger_1_fn ();
------------------------------
--------  ttfMatches  --------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "ttfMatches" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "X" BIGINT NOT NULL,
  "O" BIGINT NOT NULL,
  "board" CHAR(10) NOT NULL,
  "turn" INTEGER NOT NULL,
  "whoseTurn" BIGINT,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  "lastTurn" TIMESTAMPTZ,
  "winner" BIGINT
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_ttfMatches_X" ON "ttfMatches" ("X");


CREATE INDEX IF NOT EXISTS "idx_ttfMatches_O" ON "ttfMatches" ("O");


CREATE INDEX IF NOT EXISTS "idx_ttfMatches_board" ON "ttfMatches" ("board");


CREATE INDEX IF NOT EXISTS "idx_ttfMatches_created" ON "ttfMatches" ("created");


CREATE INDEX IF NOT EXISTS "idx_ttfMatches_updated" ON "ttfMatches" ("updated");


CREATE INDEX IF NOT EXISTS "idx_ttfMatches_winner" ON "ttfMatches" ("winner");


---- Create triggers
CREATE OR REPLACE FUNCTION ttfMatches_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS ttfMatches_trigger_1 ON "ttfMatches";


CREATE TRIGGER ttfMatches_trigger_1 BEFORE
UPDATE ON "ttfMatches" FOR EACH ROW
EXECUTE FUNCTION ttfMatches_trigger_1_fn ();
------------------------------
--------  ttmMatches  --------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "ttmMatches" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "X" BIGINT NOT NULL,
  "O" BIGINT NOT NULL,
  "board" CHAR(25) NOT NULL,
  "turn" INTEGER NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  "winner" BIGINT
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_ttmMatches_X" ON "ttmMatches" ("X");


CREATE INDEX IF NOT EXISTS "idx_ttmMatches_O" ON "ttmMatches" ("O");


CREATE INDEX IF NOT EXISTS "idx_ttmMatches_board" ON "ttmMatches" ("board");


CREATE INDEX IF NOT EXISTS "idx_ttmMatches_created" ON "ttmMatches" ("created");


CREATE INDEX IF NOT EXISTS "idx_ttmMatches_updated" ON "ttmMatches" ("updated");


CREATE INDEX IF NOT EXISTS "idx_ttmMatches_winner" ON "ttmMatches" ("winner");


---- Create triggers
CREATE OR REPLACE FUNCTION ttmMatches_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS ttmMatches_trigger_1 ON "ttmMatches";


CREATE TRIGGER ttmMatches_trigger_1 BEFORE
UPDATE ON "ttmMatches" FOR EACH ROW
EXECUTE FUNCTION ttmMatches_trigger_1_fn ();
-----------------------------
-------  userFollows  -------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "userFollows" (
  "follower" BIGINT NOT NULL,
  "followee" BIGINT NOT NULL,
  "id" TEXT PRIMARY KEY NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_userFollows_follower" ON "userFollows" ("follower");


CREATE INDEX IF NOT EXISTS "idx_userFollows_followee" ON "userFollows" ("followee");


CREATE INDEX IF NOT EXISTS "idx_userFollows_follower_followee" ON "userFollows" ("follower", "followee");


---- Create triggers
CREATE OR REPLACE FUNCTION userFollows_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS userFollows_trigger_1 ON "userFollows";


CREATE TRIGGER userFollows_trigger_1 BEFORE
UPDATE ON "userFollows" FOR EACH ROW
EXECUTE FUNCTION userFollows_trigger_1_fn ();
------------------------------
--------  userHashes  --------
------------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "userHashes" (
  "email" TEXT CHECK (length("email") <= 50) NOT NULL,
  "hash" TEXT CHECK (length("hash") <= 64) NOT NULL,
  "id" BIGINT PRIMARY KEY NOT NULL,
  "username" VARCHAR UNIQUE CHECK (length("username") <= 20) NOT NULL,
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_userHashes_username" ON "userHashes" ("username");


CREATE INDEX IF NOT EXISTS "idx_userHashes_email" ON "userHashes" ("email");


CREATE INDEX IF NOT EXISTS "idx_userHashes_hash" ON "userHashes" ("hash");
-----------------------------
----------  users  ----------
-----------------------------
---- Create table
CREATE TABLE IF NOT EXISTS "users" (
  "banned" TIMESTAMPTZ,
  "confirmed" TIMESTAMPTZ,
  "bot" BOOLEAN NOT NULL,
  "groupLimit" INTEGER CHECK ("groupLimit" >= 0) NOT NULL,
  "chatColor" CHAR(6) NOT NULL,
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "joined" TIMESTAMPTZ NOT NULL,
  "live" BOOLEAN NOT NULL,
  "profilePicture" TEXT,
  "staff" BOOLEAN NOT NULL,
  "username" VARCHAR UNIQUE CHECK (length("username") <= 20) NOT NULL,
  "channelLimit" INTEGER,
  "slug" TEXT CHECK (length("slug") <= 20) CHECK (length("slug") >= 3) NOT NULL,
  "points" BIGINT NOT NULL,
  "postCount" BIGINT NOT NULL,
  "lastLogin" TIMESTAMPTZ NOT NULL,
  "lastSuper" TIMESTAMPTZ NOT NULL,
  "owner" BIGINT,
  "name" TEXT CHECK (length("name") <= 30) CHECK (length("name") >= 3),
  "created" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated" TIMESTAMPTZ,
  "deleted" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);


---- Create indexes
CREATE INDEX IF NOT EXISTS "idx_users_lastLogin" ON "users" ("lastLogin");


CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");


CREATE INDEX IF NOT EXISTS "idx_users_bot" ON "users" ("bot");


CREATE INDEX IF NOT EXISTS "idx_users_staff" ON "users" ("staff");


---- Create triggers
CREATE OR REPLACE FUNCTION users_trigger_1_fn () RETURNS TRIGGER AS $$
BEGIN
NEW.updated = CURRENT_TIMESTAMP;
RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS users_trigger_1 ON "users";


CREATE TRIGGER users_trigger_1 BEFORE
UPDATE ON "users" FOR EACH ROW
EXECUTE FUNCTION users_trigger_1_fn ();
