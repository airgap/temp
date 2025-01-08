import { handleListenForTtfPlays } from '@lyku/handles';
import { emit } from 'process';

export default handleListenForTtfPlays(async ({ match }, { nats }) => {
	const sub = nats.subscribe(`ttfMatches.${match}`);
	for await (const msg of sub) emit(msg.data);
});
