import { handleListenForTtfPlays } from '@lyku/handles';
import { onEach } from '@lyku/helpers';

export default handleListenForTtfPlays((match, { nats, emit }) => {
	const sub = nats.subscribe(`ttfMatches.${match}`);
	onEach(sub, (msg) => emit(msg.data));
	return sub.unsubscribe;
});
