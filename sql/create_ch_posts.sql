CREATE TABLE POSTS
ON CLUSTER DEFAULT (
 id UInt64 NOT NULL,
		body Text,
		bodyType Text,
		echoes UInt64,
		group UInt64,
		hashtags Array(UInt64),
		author UInt64,
		likes UInt64,
		loves UInt64,
		publish DateTime64(3),
		replies UInt64,
		title String,
		thread Array(UInt64),
		shortcode String,
		replyTo UInt64,
		echoing UInt64,
		attachments Array(UInt64),
		created DateTime64(3),
		updated DateTime64(3),
		deleted DateTime64(3)
		)
ENGINE ReplacingMergeTree(id)
ORDER BY id
