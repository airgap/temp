import { handleListMyChannels } from '@lyku/handles';

export default handleListMyChannels(async (_, { db, requester, strings }) => {
	const channels = await db
		.selectFrom('channels')
		.where('owner', '=', requester)
		.selectAll()
		.execute();
	return channels;
});
