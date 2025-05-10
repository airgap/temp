import { handleCreateBot } from '@lyku/handles';
import { sql } from 'kysely';
import { client as pg } from '@lyku/postgres-client';
export default handleCreateBot(async ({ username }, { requester, strings }) => {
	console.log('Creating bot');
	const lowerUsername = username.toLocaleLowerCase();
	console.log('Checking for', lowerUsername);
	const existing = await pg
		.selectFrom('users')
		.select((eb) => [sql<string>`LOWER(username)`.as('username')])
		.where((eb) => sql<string>`LOWER(username)`, '=', lowerUsername)
		.executeTakeFirst();
	if (existing) throw strings.emailTaken;
	const { id } = await pg
		.insertInto('users')
		.values({
			bot: true,
			username,
			chatColor: 'FFFFFF',
			lastLogin: new Date(),
			joined: new Date(),
			owner: requester,
			live: false,
			banned: false,
			confirmed: true,
			points: 0n,
			groupLimit: 0,
			slug: username.toLocaleLowerCase(),
			staff: false,
			channelLimit: 0,
			postCount: 0n,
			lastSuper: new Date(),
			created: new Date(),
		})
		.returning('id')
		.executeTakeFirstOrThrow();
	return id;
});
