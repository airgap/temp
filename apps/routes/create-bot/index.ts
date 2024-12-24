import { handleCreateBot } from '@lyku/handles';
import { Insertable, sql } from 'kysely';
import { User } from '@lyku/json-models/index';

export const createBot = handleCreateBot(
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
		// const token = generateSessionId();
		const bot = {
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
			slug: username.toLocaleLowerCase(),
		} satisfies Insertable<User>;
		console.log('Inserting bot', { ...bot });
		const { id } = await db
			.insertInto('users')
			.values(bot)
			.returning('id')
			.executeTakeFirst();
		return { botId: id };
	}
);
