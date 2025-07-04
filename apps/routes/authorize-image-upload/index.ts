import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleAuthorizeImageUpload } from '@lyku/handles';
import { ImageDraft } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { InsertableFileDraft } from '@lyku/json-models';
export default handleAuthorizeImageUpload(
	async ({ channelId, reason }, { requester, strings }) => {
		if (!cfApiToken)
			throw new Error('We forgot to enter our Cloudflare password');

		// if (
		// 	[
		// 		'ActiveChannelBackground',
		// 		'AwayChannelBackground',
		// 		'ChannelLogo',
		// 	].includes(reason)
		// ) {
		// 	if (!channelId)
		// 		throw new Error(
		// 			`You must provide a channel ID to update ${reason
		// 				.replace(/([A-Z])/g, (a) => ` ${a.toLowerCase()}`)
		// 				.trim()}`,
		// 		);

		// 	const channel = await pg
		// 		.selectFrom('channels')
		// 		.select(['id', 'owner'])
		// 		.where('id', '=', channelId)
		// 		.executeTakeFirst();
		// 	if (!channel) throw 404;
		// 	if (channel.owner !== requester)
		// 		throw new Error(strings.youHaveNoChannelByThatId);
		// }

		const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload`;
		const metadata = {
			creator: requester.toString(),
			reason,
			// ...(channelId ? { channelId: channelId.toString() } : {}),
		} satisfies InsertableFileDraft;

		const formData = new FormData();
		formData.append('requireSignedURLs', 'false');
		formData.append('metadata', JSON.stringify(metadata));

		const response = await Bun.fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${cfApiToken}`,
			},
			body: formData,
		});

		const cfres = await response.json();
		if (!cfres.success) throw new Error(strings.imageUploadAuthorizationError);

		const imageUpload = {
			...cfres.result,
			hostId: cfres.result.id,
			creator: requester,
			reason,
			// ...(channelId ? { channelId } : {}),
			supertype: 'image',
		} satisfies InsertableFileDraft;
		delete imageUpload.id;
		await pg
			.insertInto('fileDrafts')
			.values(imageUpload)
			.executeTakeFirstOrThrow();

		return { id: cfres.result.id, url: cfres.result.uploadURL };
	},
);
