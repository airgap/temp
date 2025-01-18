import { handleListMessages } from '@lyku/handles';

export default handleListMessages(async ({ channel }, { db }) => {
	let q = await db.selectFrom('messages').selectAll();
	if (channel) q = q.where('channel', '=', channel);
	const messages = await q.orderBy('created', 'desc').limit(20).execute();
	return { messages };
});
