import { handleListenToPostCount } from '@lyku/handles';
import { onEach } from '@lyku/helpers';
import { client as nats } from '@lyku/nats-client';

export default handleListenToPostCount((_, { emit }) => {
	const sub = nats.subscribe('post.count');
	onEach(sub, (msg) => emit(msg.data));
	return sub.unsubscribe;
});
