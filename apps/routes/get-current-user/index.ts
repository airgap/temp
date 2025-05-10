import { handleGetCurrentUser } from '@lyku/handles';

import { client as pg } from '@lyku/postgres-client';

console.log('get-current-user');
export default handleGetCurrentUser(async (_, { requester, strings }) => {
	const user = await pg
		.selectFrom('users')
		.selectAll()
		.where('id', '=', requester)
		.executeTakeFirst();
	if (!user) {
		throw new Error('User not found');
	}
	console.log('user', user);
	Object.entries(user).forEach(([key, value]) => {
		console.log(typeof value, key, '=', value);
	});
	return user;
});

console.log('get-current-user');
