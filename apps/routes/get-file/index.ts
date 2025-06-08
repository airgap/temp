import { handleGetFile } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
import { client as nats } from '@lyku/nats-client';
import { decode } from '@msgpack/msgpack';
import { FileDoc } from '@lyku/json-models';

export default handleGetFile(async ({ file: id, wait }, {}) => {
	if (!wait)
		return pg
			.selectFrom('files')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirst()
			.then((p) => {
				if (!p) throw new Err(404);
				return p;
			});
	const sub = nats.subscribe(`fileUploads.${id}`);
	sub.unsubscribe(1);
	console.log('Waiting for file', id);
	for await (const event of sub) {
		const d = decode(event.data, { useBigInt64: true }) as FileDoc;
		console.log('Got waited file!', d);
		return d;
	}
});
