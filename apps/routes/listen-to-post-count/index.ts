import { handleListenToPostCount } from '@lyku/handles';
import * as nats from 'nats';

const nc = await nats.connect();

export default handleListenToPostCount(async (_, { db, emit, socket }) => {
	const sub = nc.subscribe('post.count');
	socket.on('close', () => sub.unsubscribe());
	for await (const msg of sub) emit(msg.data);
});
