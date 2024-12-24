import { now } from 'rethinkdb';

import { useContract } from '../Contract';
import { FromSchema } from 'from-schema';
import { user, monolith } from 'models';
import { Insertable } from '../types/Insertable';
import { handleCreateBot } from '@lyku/handles';
import { sql } from 'kysely';

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
			lastLogin: now(),
			joined: now(),
			owner: requester,
			live: false,
			banned: false,
			confirmed: true,
			points: 0,
			slug: username.toLocaleLowerCase(),
		} satisfies Insertable<FromSchema<typeof user>>;
		console.log('Inserting bot', { ...bot });
		const { id } = await db
			.insertInto('users')
			.values(bot)
			.returning('id')
			.executeTakeFirst();
		return { id };
	}
);
