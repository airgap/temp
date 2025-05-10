import { handleGetUserByName } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';

export default handleGetUserByName(async (username, {}) => {
	const user = await pg
		.selectFrom('users')
		.selectAll()
		.where('slug', '=', username.toLocaleLowerCase())
		.executeTakeFirst();
	if (!user) throw new Err(404, 'User not found');
	return user;
});
