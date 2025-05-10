import { handleListMyBots } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListMyBots(async ({}, { requester }) => {
	const bots = await pg
		.selectFrom('users')
		.where('bot', '=', true)
		.where('owner', '=', requester)
		.selectAll()
		.execute();
	return bots;
});
