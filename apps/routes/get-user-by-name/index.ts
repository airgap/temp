import { handleGetUserByName } from '@lyku/handles';
import { Err } from '@lyku/helpers';

export default handleGetUserByName(async (username, { db }) => {
	const user = await db
		.selectFrom('users')
		.selectAll()
		.where('slug', '=', username.toLocaleLowerCase())
		.executeTakeFirst();
	if (!user) throw new Err(404, 'User not found');
	return user;
});
