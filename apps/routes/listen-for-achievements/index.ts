import { handleListenForAchievements } from '@lyku/handles';

export default handleListenForAchievements(
	async (_, { nats, emit, requester, socket }) => {
		const sub = nats.subscribe(`achievementGrants.${requester}`);
		socket.on('close', () => sub.unsubscribe());
		for await (const msg of sub) emit(msg.data);
	}
);
