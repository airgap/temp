import { handleAwaitFile } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
import { client as nats } from '@lyku/nats-client';
import { client as valkey } from '@lyku/redis-client';
import { unpack } from 'msgpackr/unpack';
import { FileDoc } from '@lyku/json-models';
import { parseBON } from 'from-schema';

export default handleAwaitFile(async (id, { emit }) => {
	console.log('awaiting file', id);
	const f = await valkey.getBuffer(`file:${id}`);
	if (f) {
		console.log('f', f);
		const parsed = unpack(f);
		console.log('parsed', parsed);
		emit(parsed);
		return;
	}
	const sub = nats.subscribe(`fileUploads.${id}`);
	sub.unsubscribe(1);
	console.log('Waiting for file', id);
	for await (const event of sub) {
		const d = unpack(event.data) as FileDoc;
		console.log('Got waited file!', d);
		emit(d);
	}
});
