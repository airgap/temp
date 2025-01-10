import { handleCreateBot } from '@lyku/handles';
import { Insertable, sql } from 'kysely';
import { User } from '@lyku/json-models';

export default handleCreateBot(
	async ({ username }, { db, requester, strings }) => {
		console.log('Creating bot');
		const lowerUsername = username.toLocaleLowerCase();
		console.log('Checking for', lowerUsername);
		const existing = await db
			.selectFrom('users')
			.select((eb) => [sql<string>`LOWER(username)`.as('username')])
			.where((eb) => sql<string>`LOWER(username)`, '=', lowerUsername)
			.executeTakeFirst();
		if (existing) throw strings.emailTaken;
		const { id } = await db
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
				points: 0,
				groupLimit: 0,
				slug: username.toLocaleLowerCase(),
				staff: false,
				channelLimit: 0,
				postCount: 0n,
				lastSuper: new Date(),
			})
			.returning('id')
			.executeTakeFirstOrThrow();
		return id;
	}
);
