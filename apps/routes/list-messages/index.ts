import { handleListMessages } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListMessages(async ({ channel }, { requester }) => {
	let q = await pg
		.selectFrom('messages')
		.selectAll()
		.where('author', '=', requester);
	if (channel) q = q.where('channel', '=', channel);
	const messages = await q.orderBy('created', 'desc').limit(20).execute();
	return { messages };
});
