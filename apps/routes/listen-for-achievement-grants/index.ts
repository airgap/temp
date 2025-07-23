import { handleListenForAchievementGrants } from '@lyku/handles';
import { client as nats } from '@lyku/nats-client';
import { onEach } from '@lyku/helpers';

export default handleListenForAchievementGrants(
	(_, { emit, requester, socket }) => {
		const sub = nats.subscribe(`achievementGrants.${requester}`);
		onEach(sub, ({ data }) => emit(data));
		console.log(requester, 'is listening for achievement grants');
		return sub.unsubscribe;
	},
);
