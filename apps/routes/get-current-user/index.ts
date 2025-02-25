import { handleGetCurrentUser } from '@lyku/handles';

console.log('get-current-user');
export default handleGetCurrentUser(async (_, { db, requester, strings }) => {
	const user = await db
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
