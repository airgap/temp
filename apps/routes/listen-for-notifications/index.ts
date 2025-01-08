import { handleListenForNotifications } from '@lyku/handles';

export default handleListenForNotifications(
	async (_, { nats, requester, emit, socket }) => {
		const sub = nats.subscribe(`notifications.${requester}`);
		socket.on('close', () => sub.unsubscribe());
		for await (const msg of sub) emit(msg.data);
	}
);
