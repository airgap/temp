import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { run } from '@lyku/route-helpers';
import { handleConfirmImageUpload } from '@lyku/handles';
import { InsertableImageDoc } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { InsertableFileDoc } from '@lyku/json-models';
import { client as nats } from '@lyku/nats-client';
import { FileDoc } from '@lyku/json-models';
import { pack } from 'msgpackr';
interface CloudflareImageResponse {
	success: boolean;
	result: {
		id: string;
		// Add other result fields as needed
		[key: string]: any;
	};
}

export default handleConfirmImageUpload(async (id, { requester, strings }) => {
	console.log('Confirming image upload', id);
	if (!cfApiToken)
		throw new Error('We forgot to enter our Cloudflare password');

	// Find the image draft and verify ownership
	const imageDraft = await pg
		.selectFrom('fileDrafts')
		.where('id', '=', id)
		.where('creator', '=', requester)
		.selectAll()
		.executeTakeFirst();

	if (!imageDraft) throw new Error('Invalid image draft');

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

	const cfres = (await response.json()) as CloudflareImageResponse;
	console.log('CFRES', cfres);
	// const bod = cfres.body.toString();
	// console.log('bod', bod);
	// const json = JSON.parse(bod) as CreateStreamResponse;
	// console.log('Cloudflare image upload response:', json);
	if (!cfres.success) throw new Error(strings.imageUploadAuthorizationError);

	// Insert new image record
	const [record] = await pg
		.insertInto('files')
		.values({
			id,
			creator: requester,
			supertype: 'image',
			host: 'cf',
			type: imageDraft.type,
			hostId: id,
			width: imageDraft.width,
			height: imageDraft.height,
			// meta: {
			// 	type: 'object',
			// 	properties: {}
			// },
			size: imageDraft.size,
			status: 'ready',
			// thumbnail: imageDraft.thumbnail,
			post: imageDraft.post,
			// ...(imageDraft.channel ? { channelId: imageDraft.channel } : {}),
			// ...(imageDraft.reason ? { reason: imageDraft.reason } : {}),
		} satisfies FileDoc)
		.returningAll()
		.execute();

	if (!record) throw new Error(strings.unknownBackendError);
	const reason = imageDraft.reason;

	nats.publish(`fileUploads.${id}`, Uint8Array.from(pack(record)));
	// Handle special image upload cases
	const postReasons = {
		ChannelLogo: 'logo',
		ActiveChannelBackground: 'activeBg',
		AwayChannelBackground: 'awayBg',
	} as const;

	// Update channel or user profile based on reason
	// if (reason && reason in postReasons && imageDraft.channel) {
	// 	await pg
	// 		.updateTable('channels')
	// 		.set({
	// 			[postReasons[reason as keyof typeof postReasons]]: cfres.result.id,
	// 		})
	// 		.where('id', '=', imageDraft.channel)
	// 		.execute();
	// } else if (reason === 'ProfilePicture') {
	// 	await pg
	// 		.updateTable('users')
	// 		.set({
	// 			profilePicture: `https://imagedelivery.net/${cfAccountId}/4390912/btvprofile`,
	// 		})
	// 		.where('id', '=', requester)
	// 		.execute();
	// }
});
