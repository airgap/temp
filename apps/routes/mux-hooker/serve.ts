import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleConfirmPfpUpload } from '@lyku/handles';
import { InsertableImageDoc } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as mux } from '@lyku/mux-client';
import { json, send } from 'micro';
import { Err } from '@lyku/helpers';
import { getPhrasebook } from '@lyku/phrasebooks';
import { ReadyEvent } from './ReadyEvent';
const strings = getPhrasebook('en-US');
Bun.serve({
	fetch: async (req, res) => {
		// We'll grab the request body again, this time grabbing the event
		// type and event data so we can easily use it.
		const parsed = await json(req);
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
				const id = BigInt(p.object.id);
				const videoUpload = await pg
					.selectFrom('videoDrafts')
					.selectAll()
					.where('id', '=', id)
					// .where('user', '=', requester)
					.executeTakeFirst();

				if (!videoUpload) {
					throw new Err(404, `Video draft ${id} not found`);
				}
				const videoTrack = p.data.tracks.find((t) => t.type === 'video');
				if (!videoTrack) throw new Err(500, 'Mux asset has no video track');
				const dbres = await pg
					.insertInto('videos')
					.values({
						id,
						width: videoTrack.max_width,
						height: videoTrack.max_height,
						duration: videoTrack.duration,
						created: new Date(p.created_at),
						creator: videoUpload.creator,
						status: p.data.status,
					})
					.returning('id')
					.executeTakeFirst();

				console.log('dbres', dbres);

				if (!dbres) throw new Err(500, strings.unknownBackendError);
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
	},
});
