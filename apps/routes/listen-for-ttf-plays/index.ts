import { handleListenForTtfPlays } from '@lyku/handles';
import { onEach } from '@lyku/helpers';
import { client as nats } from '@lyku/nats-client';

export default handleListenForTtfPlays((match, { emit }) => {
	const sub = nats.subscribe(`ttfMatches.${match}`);
	onEach(sub, (msg) => emit(msg.data));
	return sub.unsubscribe;
});
