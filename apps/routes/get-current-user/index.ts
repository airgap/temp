import { handleGetCurrentUser } from '@lyku/handles';
import { client as redis } from '@lyku/redis-client';
import { client as pg } from '@lyku/postgres-client';
import { parseBON, stringifyBON } from 'from-schema';
import { User } from '@lyku/json-models';
import { Err } from '@lyku/helpers';
import { pack, unpack } from 'msgpackr';

export default handleGetCurrentUser(async (_, { requester }) => {
	let user: User | undefined = undefined;
	const text = await redis.getBuffer(`user:${requester}`);
	if (text) user = unpack(text) as User;
	else {
		user = await pg
			.selectFrom('users')
			.where('id', '=', requester)
			.selectAll()
			.executeTakeFirst();
		if (user) {
			await redis.set(`user:${requester}`, pack(user));
		}
	}
	if (!user) throw new Err(500, 'Session exists but user does not');
	return user;
});

console.log('get-current-user');
