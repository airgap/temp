import { handleListenForNotifications } from '@lyku/handles';
import { onEach } from '@lyku/helpers';
import { client as nats } from '@lyku/nats-client';

export default handleListenForNotifications((_, { requester, emit }) => {
	const sub = nats.subscribe(`notifications.${requester}`);
	onEach(sub, (msg) => emit(msg.data));
	return sub.unsubscribe;
});
