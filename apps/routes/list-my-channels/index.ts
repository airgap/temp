import { handleListMyChannels } from '@lyku/handles';
import { client as db } from '@lyku/postgres-client';

export default handleListMyChannels(async (_, { requester, strings }) => {
	const channels = await db
		.selectFrom('channels')
		.where('owner', '=', requester)
		.selectAll()
		.execute();
	return channels;
});
