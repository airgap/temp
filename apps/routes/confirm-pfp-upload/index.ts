import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleConfirmPfpUpload } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';

export default handleConfirmPfpUpload(async (id, { requester, strings }) => {
	console.log('Confirming pfp upload', id);
	if (!cfApiToken)
		throw new Error('We forgot to enter our Cloudflare password');

	// Find the image draft and verify ownership
	const imageDraft = await pg
		.selectFrom('pfpDrafts')
		.where('id', '=', id)
		.where('creator', '=', requester)
		.where('type', 'like', 'image/%')
		.selectAll()
		.executeTakeFirst();

	if (!imageDraft) throw new Error('Invalid image draft');

	// res = await mux.video.

	const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1/${id}`;
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
	await pg
		.updateTable('users')
		.set({
			profilePicture: `https://imagedelivery.net/${cfAccountId}/4390912/btvprofile`,
		})
		.where('id', '=', requester)
		.execute();
});
