import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleConfirmGroupIconUpload } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { pack } from 'msgpackr';

export default handleConfirmGroupIconUpload(
	async ({ id }, { requester, strings }) => {
		console.log('Confirming group icon upload', id);
		if (!cfApiToken)
			throw new Error('We forgot to enter our Cloudflare password');

		// Find the image draft and verify ownership
		const imageDraft = await pg
			.selectFrom('groupIconDrafts')
			.where('id', '=', id)
			.where('creator', '=', requester)
			// .where('type', 'like', 'image/%')
			.selectAll()
			.executeTakeFirst();

		if (!imageDraft) throw new Error('Invalid image draft');

		// res = await mux.video.
		const { hostId } = imageDraft;
		const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1/${hostId}`;
		console.log('URL', url);
		requester;
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${cfApiToken}`,
			},
		});

		if (!response.ok) {
			throw new Error(strings.imageUploadAuthorizationError);
		}

		const cfres = await response.json();
		console.log('CFRES', cfres);
		// const bod = cfres.body.toString();
		// console.log('bod', bod);
		// const json = JSON.parse(bod) as CreateStreamResponse;
		// console.log('Cloudflare image upload response:', json);
		if (!cfres.success) throw new Error(strings.imageUploadAuthorizationError);

		// Insert new image record
		// const [record] = await pg
		// 	.insertInto('files')
		// 	.values({
		// 		id,
		// 		uploader: requester,
		// 	} satisfies InsertableFileDoc)
		// 	.returningAll()
		// 	.execute();

		// if (!record) throw new Error(strings.unknownBackendError);
		const icon = cfres.result.variants.find((v) => v.endsWith('btvprofile'));
		console.log('Group icon', icon);
		const updated = await pg
			.updateTable('groups')
			.set({
				icon,
			})
			.where('id', '=', imageDraft.group)
			.returningAll()
			.executeTakeFirstOrThrow();
		console.log('Updated', updated);
		await redis.set(`group:${requester}`, pack(updated));
	},
);
