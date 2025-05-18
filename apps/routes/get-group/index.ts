import { handleGetGroup } from '@lyku/handles';
import { bindIds, Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { defaultLogger as logger } from '@lyku/logger';

export default handleGetGroup(async (id, { requester }) => {
	try {
		// Check Redis cache first
		const groupCacheKey = `group:{${id}}`;
		let groupData = await redis.get(groupCacheKey);
		let group;

		if (!groupData) {
			// Cache miss - query from database
			group = await pg
				.selectFrom('groups')
				.selectAll()
				.where('id', '=', id)
				.executeTakeFirst();

			if (!group) throw new Err(404, 'Group not found');

			// Cache the group with a 1-hour expiration
			await redis.set(groupCacheKey, JSON.stringify(group), 'EX', 3600);
		} else {
			// Cache hit - parse the stored JSON data
			group = JSON.parse(groupData);
		}

		// If there's no requester, just return the group
		if (!requester) {
			return { group };
		}

		// Check for membership (we don't cache this to ensure permissions are always current)
		const membershipCacheKey = `group:{${id}}:member:{${requester}}`;
		let membershipData = await redis.get(membershipCacheKey);
		let membership;

		if (!membershipData) {
			// Query membership from database
			membership = await pg
				.selectFrom('groupMemberships')
				.selectAll()
				.where('id', '=', bindIds(requester, id))
				.executeTakeFirst();

			// Cache membership with a shorter expiration (15 minutes)
			if (membership) {
				await redis.set(
					membershipCacheKey,
					JSON.stringify(membership),
					'EX',
					900,
				);
			} else {
				// Cache negative result for a short time (5 minutes)
				await redis.set(membershipCacheKey, 'null', 'EX', 300);
			}
		} else if (membershipData !== 'null') {
			// Cache hit - parse the stored JSON data
			membership = JSON.parse(membershipData);
		}

		return {
			group,
			...(typeof membership === 'object' ? { membership } : {}),
		};
	} catch (error) {
		// If Redis fails, fall back to direct database query
		if (!(error instanceof Err)) {
			logger.error('Redis operation failed in getGroup', {
				error,
				groupId: id,
				userId: requester,
			});

			// Fall back to direct database query
			const group = await pg
				.selectFrom('groups')
				.selectAll()
				.where('id', '=', id)
				.executeTakeFirst();

			if (!group) throw new Err(404, 'Group not found');

			const membership = requester
				? await pg
						.selectFrom('groupMemberships')
						.selectAll()
						.where('id', '=', bindIds(requester, id))
						.executeTakeFirst()
				: null;

			return {
				group,
				...(typeof membership === 'object' ? { membership } : {}),
			};
		}

		// Re-throw Err instances (like 404)
		throw error;
	}
});
