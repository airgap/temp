import { handleListGroupsImIn } from '@lyku/handles';
import { Group } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { pack, unpack } from 'msgpackr';
export default handleListGroupsImIn(async (_, { requester }) => {
	// Try to get requester's group membership list
	let ids = await redis.smembers(`user:${requester}:groups`);

	if (!ids) {
		// Get the details of every group the user is in from Postgres
		const groups = await pg
			.selectFrom('groups')
			.selectAll()
			.innerJoin('groupMemberships', 'groupMemberships.group', 'groups.id')
			.where('groupMemberships.user', '=', requester)
			.execute();

		// Cache the group id list in redis
		ids = groups.map(({ id }) => id.toString());
		await redis.sadd(`user:${requester}:groups`, ids);

		// Don't cache the groups themselves, at least for now
		// Maybe remove the join later and query memberships and groups separately
		// Unsure about performance and latency
		return { groups };
	}

	// Ok so the Redis membership listing hit, so get the groups themselves from redis
	const groups: Group[] = [];
	// Unparsed groups
	let groupStrings = await redis.hmget(`groups`, ...ids);
	// Acquired post ids (to fill)
	const gotIds = new Set<bigint>();

	// Parse hits and mark id as hit
	for (let g of groupStrings)
		if (g) {
			const group = unpack(g) as Group;
			groups.push(group);
			gotIds.add(group.id);
		}

	// Get any missing groups from Postgres and cache in Redis
	let missingIds = new Set(ids).difference(gotIds);
	if (missingIds.size) {
		const missingGroups = await pg
			.selectFrom('groups')
			.selectAll()
			.where('id', 'in', [...missingIds].map(BigInt))
			.execute();
		groups.push(...missingGroups);
		await redis.hset(
			`groups`,
			...missingGroups.flatMap((group) => [group.id.toString(), pack(group)]),
		);
	}
	return { groups };
});
