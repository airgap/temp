import { handleListenToPoints } from '@lyku/handles';
import { onEach } from '@lyku/helpers';
import { client as nats } from '@lyku/nats-client';

export default handleListenToPoints((_, { emit, requester }) => {
	const sub = nats.subscribe(`user:${requester}:points`);
	onEach(sub, (msg) => emit(BigInt(msg.string())));
	return sub.unsubscribe;
});
