import { handleListenToPostCount } from '@lyku/handles';
import { onEach } from '@lyku/helpers';

export default handleListenToPostCount((_, { emit, nats }) => {
	const sub = nats.subscribe('post.count');
	onEach(sub, (msg) => emit(msg.data));
	return sub.unsubscribe;
});
