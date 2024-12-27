import { handleGetUserByName } from '@lyku/handles';

export const getUser = handleGetUserByName(async ({ username }, { db }) =>
	db
		.selectFrom('users')
		.selectAll()
		.where('username', '=', username)
		.executeTakeFirst()
);
