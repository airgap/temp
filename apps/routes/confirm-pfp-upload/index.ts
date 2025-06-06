import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleConfirmPfpUpload } from '@lyku/handles';
import { InsertableImageDoc } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as mux } from '@lyku/mux-client';

export default handleConfirmPfpUpload(async (id, { requester, strings }) => {
	console.log('Confirming pfp upload', id);
	if (!cfApiToken)
		throw new Error('We forgot to enter our Cloudflare password');

	// Find the image draft and verify ownership
	const imageDraft = await pg
		.selectFrom('imageDrafts')
		.where('id', '=', id)
		.where('author', '=', requester)
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
	const [record] = await pg
		.insertInto('images')
		.values({
			id,
			uploader: requester,
			...(imageDraft.channel ? { channelId: imageDraft.channel } : {}),
			// ...(imageDraft.reason ? { reason: imageDraft.reason } : {}),
		} satisfies InsertableImageDoc)
		.returningAll()
		.execute();

	if (!record) throw new Error(strings.unknownBackendError);
	const reason = imageDraft.reason;

	// Handle special image upload cases
	const postReasons = {
		ChannelLogo: 'logo',
		ActiveChannelBackground: 'activeBg',
		AwayChannelBackground: 'awayBg',
	} as const;

	// Update channel or user profile based on reason
	if (reason && reason in postReasons && imageDraft.channel) {
		await pg
			.updateTable('channels')
			.set({
				[postReasons[reason as keyof typeof postReasons]]: cfres.result.id,
			})
			.where('id', '=', imageDraft.channel)
			.execute();
	} else if (reason === 'ProfilePicture') {
		await pg
			.updateTable('users')
			.set({
				profilePicture: `https://imagedelivery.net/${cfAccountId}/4390912/btvprofile`,
			})
			.where('id', '=', requester)
			.execute();
	}
});
