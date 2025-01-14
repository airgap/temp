import { handleListenForNotifications } from '@lyku/handles';
import { onEach } from '@lyku/helpers';

export default handleListenForNotifications(
	(_, { nats, requester, emit, socket }) => {
		const sub = nats.subscribe(`notifications.${requester}`);
		onEach(sub, (msg) => emit(msg.data));
		return sub.unsubscribe;
	}
);
