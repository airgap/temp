import { handleJoinGroup } from '@lyku/handles';
import { bindIds, Err } from '@lyku/helpers';
import { Group } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { parseBON } from 'from-schema';

export default handleJoinGroup(async (group, { requester, now }) => {
	const gString = group.toString();
	const cachedMembership = await redis.sismember(
		`user:${requester}:groups`,
		gString,
	);
	if (cachedMembership) throw new Err(409, 'Already joined');
	const cachedGroup = await redis.hget(`groups`, gString);
	const groupData = cachedGroup
		? (parseBON(cachedGroup) as Group)
		: await pg
				.selectFrom('groups')
				.select('private')
				.where('id', '=', group)
				.executeTakeFirst();
	if (groupData && !cachedGroup)
		await redis.hset(`groups`, gString, JSON.stringify(groupData));
	if (groupData?.private === false) {
		const res = await pg
			.insertInto('groupMemberships')
			.values({
				group,
				user: requester,
				created: now,
				updated: now,
			})
			.executeTakeFirst();
		await redis.sadd(`user:${requester}:groups`, gString);
		if (!res) throw new Err(500, 'Cannot join');
		if (!res.insertId) throw new Err(409, 'Already joined');
	} else {
		throw new Error('Cannot join');
	}
});
