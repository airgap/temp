import { handleListMyBots } from '@lyku/handles';

export default handleListMyBots(async ({}, { db, requester }) => {
	const bots = await db
		.selectFrom('users')
		.where('bot', '=', true)
		.where('owner', '=', requester)
		.selectAll()
		.execute();
	return bots;
});
