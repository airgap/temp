import { handleGetMyReactions } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { type Reaction } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';

export default handleGetMyReactions(async (ids, { requester }) => {
	// Return empty object if no post IDs provided
	if (ids.length === 0) {
		return [];
	}

	const map = new Map<bigint, Reaction>();
	const postIdStrings = ids.map((id) => id.toString());
	const requesterStr = requester.toString();
	const missingPostIds: bigint[] = [];

	try {
		// Prepare pipeline for batch operations
		const pipeline = redis.pipeline();

		// Query post::reactions hashes for each post
		for (const postId of ids) {
			const postIdStr = postId.toString();
			pipeline.hget(`post:{${postId}}:reactions`, requesterStr);
		}

		// Execute all Redis operations in a single batch
		const reactions = await pipeline.exec();

		if (!reactions) throw new Err(500);

		// Process results and identify missing posts
		for (let i = 0; i < ids.length; i++) {
			const postId = ids[i];
			const postIdStr = postId.toString();
			const [err, reaction] = reactions[i];

			if (err) {
				console.error('Redis error when fetching reaction', {
					postId,
					error: err,
				});
				missingPostIds.push(postId);
			} else if (reaction === null) {
				// Reaction not found in Redis
				missingPostIds.push(postId);
			} else {
				// Reaction found in Redis
				map.set(postId, reaction as string);
			}
		}

		// Fetch missing reactions from PostgreSQL
		if (missingPostIds.length > 0) {
			const dbReactions = await pg
				.selectFrom('reactions')
				.select(['postId', 'type'])
				.where('postId', 'in', missingPostIds)
				.where('userId', '=', requester)
				.execute();

			// Process DB results and update Redis cache
			// Process DB results and update Redis cache
			if (dbReactions.length > 0) {
				const cachePipeline = redis.pipeline();

				// Prepare arrays for user reactions batch operation
				const userReactionPairs = [];

				for (const reaction of dbReactions) {
					const postIdStr = reaction.postId.toString();
					// Add to result
					map.set(reaction.postId, reaction.type);

					// Update post's reactions hash (one hset per post, as they're different keys)
					cachePipeline.hset(
						`post:{${reaction.postId}}:reactions`,
						requesterStr,
						reaction.type,
					);

					// Collect all user reactions for a single batch hset
					userReactionPairs.push(postIdStr, reaction.type);
				}

				// Add user reactions in a single hset command if we have any
				if (userReactionPairs.length > 0) {
					cachePipeline.hset(
						`user:{${requester}}:reactions`,
						...userReactionPairs,
					);
				}

				// Execute cache updates (non-blocking)
				cachePipeline.exec().catch((error) => {
					console.error('Failed to update Redis cache for reactions', {
						error,
						userId: requester,
					});
				});
			}
		}
	} catch (error) {
		// If Redis fails, fall back to database
		console.error('Redis operation failed in getMyReactions', {
			error,
			userId: requester,
		});

		// Direct DB query for all specified posts
		const dbReactions = await pg
			.selectFrom('reactions')
			.select(['postId', 'type'])
			.where('postId', 'in', ids)
			.where('userId', '=', requester)
			.execute();

		for (const reaction of dbReactions) {
			map.set(reaction.postId, reaction.type);
		}
	}

	return ids.map((id) => map.get(id) || '');
});
