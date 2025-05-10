import { handleListenForAchievements } from '@lyku/handles';
import { client as nats } from '@lyku/nats-client';
import { onEach } from '@lyku/helpers';

export default handleListenForAchievements((_, { emit, requester, socket }) => {
	const sub = nats.subscribe(`achievementGrants.${requester}`);
	onEach(sub, ({ data }) => emit(data));
	return sub.unsubscribe;
});
