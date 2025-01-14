import { handleGetUserByName } from '@lyku/handles';

export default handleGetUserByName(async (username, { db }) =>
	db
		.selectFrom('users')
		.selectAll()
		.where('username', '=', username)
		.executeTakeFirstOrThrow()
);
