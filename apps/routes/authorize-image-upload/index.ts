import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleAuthorizeImageUpload } from '@lyku/handles';
import { run } from '@lyku/route-helpers';
import { ImageDraft } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
export default handleAuthorizeImageUpload(
	async ({ channelId, reason }, { requester, strings }) => {
		if (!cfApiToken)
			throw new Error('We forgot to enter our Cloudflare password');

		if (
			[
				'ActiveChannelBackground',
				'AwayChannelBackground',
				'ChannelLogo',
			].includes(reason)
		) {
			if (!channelId)
				throw new Error(
					`You must provide a channel ID to update ${reason
						.replace(/([A-Z])/g, (a) => ` ${a.toLowerCase()}`)
						.trim()}`,
				);

			const channel = await pg
				.selectFrom('channels')
				.select(['id', 'owner'])
				.where('id', '=', channelId)
				.executeTakeFirst();
			if (!channel) throw 404;
			if (channel.owner !== requester)
				throw new Error(strings.youHaveNoChannelByThatId);
		}

		const command = `curl --request POST --url https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload --header 'Content-Type: multipart/form-data' --header 'Authorization: Bearer ${cfApiToken}' --form 'requireSignedURLs=false' --form 'metadata={"testKey": "testValue"}'`;
		const { stdout } = (await run(command)) as any;
		const cfres = JSON.parse(stdout);
		if (!cfres.success) throw new Error(strings.imageUploadAuthorizationError);

		const imageUpload: ImageDraft = {
			...cfres.result,
			userId: requester,
			reason,
			...(channelId ? { channelId } : {}),
			supertype: 'image',
		};
		await pg
			.insertInto('imageDrafts')
			.values(imageUpload)
			.executeTakeFirstOrThrow();

		return { id: cfres.result.id, url: cfres.result.uploadURL };
	},
);
