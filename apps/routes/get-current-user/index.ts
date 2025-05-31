import { handleGetCurrentUser } from '@lyku/handles';
import { client as redis } from '@lyku/redis-client';
import { client as pg } from '@lyku/postgres-client';
import { parseBON, stringifyBON } from 'from-schema';
import { User } from '@lyku/json-models';
import { Err } from '@lyku/helpers';

export default handleGetCurrentUser(async (_, { requester }) => {
	let user: User | undefined = undefined;
	const text = await redis.get(`user:${requester}`);
	if (text) user = parseBON<User>(text);
	else {
		user = await pg
			.selectFrom('users')
			.where('id', '=', requester)
			.selectAll()
			.executeTakeFirst();
		if (user) {
			await redis.set(`user:${requester}`, stringifyBON(user));
		}
	}
	if (!user) throw new Err(500, 'Session exists but user does not');
	return user;
});

console.log('get-current-user');
