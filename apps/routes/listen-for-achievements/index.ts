import { handleListenForAchievements } from '@lyku/handles';
import { onEach } from '@lyku/helpers';

export default handleListenForAchievements(
	(_, { nats, emit, requester, socket }) => {
		const sub = nats.subscribe(`achievementGrants.${requester}`);
		onEach(sub, ({ data }) => emit(data));
		return sub.unsubscribe;
	},
);
