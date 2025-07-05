import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleConfirmPfpUpload } from '@lyku/handles';
import { InsertableImageDoc } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as mux } from '@lyku/mux-client';
import { json, send } from 'micro';
import { Err } from '@lyku/helpers';
import { getPhrasebook } from '@lyku/phrasebooks';
import { ReadyEvent } from './ReadyEvent';
import { startHealthCheckServer } from './http-server';
import { client as nats } from '@lyku/nats-client';
// import { encode } from '@msgpack/msgpack';
import { FileDoc } from '@lyku/json-models';
import { client as valkey } from '@lyku/redis-client';
import { pack } from 'msgpackr';
const strings = getPhrasebook('en-US');
Bun.serve({
	routes: {
		'/health': (req) => {
			console.log('Health check', req.method, req.url);
			return new Response(':D');
		},
		'/': async (req, res) => {
			console.log('GOT /', req.method, req.url);
			// We'll grab the request body again, this time grabbing the event
			// type and event data so we can easily use it.
			const parsed = await req.json();
			const { type: eventType, data: eventData } = parsed;

			switch (eventType) {
				// case 'video.asset.created': {
				//   // This means an Asset was successfully created! We'll get
				//   // the existing item from the DB first, then update it with the
				//   // new Asset details
				//   const item = await db.get(eventData.passthrough);
				//   // Just in case the events got here out of order, make sure the
				//   // asset isn't already set to ready before blindly updating it!
				//   if (item.asset.status !== 'ready') {
				//     await db.put(item.id, {
				//       ...item,
				//       asset: eventData,
				//     });
				//   }
				//   break;
				// };
				case 'video.asset.ready': {
					const p = parsed as ReadyEvent;
					// This means an Asset was successfully created! This is the final
					// state of an Asset in this stage of its lifecycle, so we don't need
					// to check anything first.
					//   const item = await db.get(eventData.passthrough);
					// await db.put(item.id, {
					//   ...item,
					//   asset: eventData,
					//   });
					// console.log('Event', p);
					const pass = p.data.passthrough;
					if (!pass) throw 'No passthrough!';
					const id = BigInt(pass);
					console.log('Passthrough', pass, 'id', id);
					const videoUpload = await pg
						.selectFrom('fileDrafts')
						.selectAll()
						.where('id', '=', id)
						// .where('user', '=', requester)
						.executeTakeFirst();

					if (!videoUpload) {
						throw new Err(404, `Video draft ${id} not found`);
					}
					const videoTrack = p.data.tracks.find((t) => t.type === 'video');
					if (!videoTrack) throw new Err(500, 'Mux asset has no video track');
					const hostId = p.data.playback_ids[0].id;
					if (!hostId) throw new Err(500, 'Mux asset has no host id');
					const file = {
						id,
						hostId,
						width: videoTrack.max_width,
						height: videoTrack.max_height,
						duration: videoTrack.duration,
						created: new Date(p.created_at),
						creator: videoUpload.creator,
						status: p.data.status,
						type: videoUpload.type,
						supertype: 'video',
						host: 'mux',
					} satisfies FileDoc;
					const dbres = await pg
						.insertInto('files')
						.values(file)
						.returning('id')
						.executeTakeFirst();

					console.log('dbres', dbres);

					if (!dbres) throw new Err(500, strings.unknownBackendError);
					const pkg = pack(file);
					await valkey.set(`file:${id}`, pkg);
					nats.publish(`fileUploads.${id}`, Uint8Array.from(pkg));
					console.log('Published to NATS');

					break;
				}
				case 'video.upload.cancelled': {
					// This fires when you decide you want to cancel an upload, so you
					// may want to update your internal state to reflect that it's no longer
					// active.
					// const item = await db.findByUploadId(eventData.passthrough);
					// await db.put(item.id, { ...item, status: 'cancelled_upload' });
				}
				default:
					// Mux sends webhooks for *lots* of things, but we'll ignore those for now
					console.log('some other event!', eventType, eventData);
			}
			console.warn('Event type not handled yet');
			return new Response('Event type not handled yet');
		},
	},
	// port: 3000,
});
// const httpPort = parseInt(process.env.HEALTH_CHECK_PORT || '8080', 10);

// startHealthCheckServer(httpPort);
