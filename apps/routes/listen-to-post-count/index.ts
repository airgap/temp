import { handleListenToPostCount } from '@lyku/handles';

export default handleListenToPostCount(async (_, { emit, socket, nats }) => {
	const sub = nats.subscribe('post.count');
	socket.on('close', () => sub.unsubscribe());
	for await (const msg of sub) emit(msg.data);
});
