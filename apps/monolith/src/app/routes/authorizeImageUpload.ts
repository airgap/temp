import { imageDraft, monolith } from 'models';
import { useContract } from '../Contract';
import { cfAccountId, cfApiToken } from '../env';
import { run } from '../run';
import { FromSchema } from 'from-schema';

export const authorizeImageUpload = useContract(
	monolith.authorizeImageUpload,
	async (
		{ channelId, reason },
		{ tables, connection },
		{ userId },
		strings
	) => {
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
						.trim()}`
				);

			const channel = tables.channels.get(channelId);
			const authRes = await channel
				.and(channel('owner').eq(userId))
				.branch(channel, { error: strings.youHaveNoChannelByThatId })
				.run(connection);
			if ('error' in authRes) throw new Error(authRes.error);
		}

		const command = `curl --request POST --url https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload --header 'Content-Type: multipart/form-data' --header 'Authorization: Bearer ${cfApiToken}' --form 'requireSignedURLs=false' --form 'metadata={"eatAss": "smokeGrass"}'`;
		const { stdout } = await run(command);
		const cfres = JSON.parse(stdout);
		if (!cfres.success) throw new Error(strings.imageUploadAuthorizationError);

		const imageUpload: FromSchema<typeof imageDraft> = {
			...cfres.result,
			userId,
			reason,
			...(channelId ? { channelId } : {}),
			supertype: 'image',
		};
		await tables.imageDrafts.insert(imageUpload).run(connection);

		return { id: cfres.result.id, url: cfres.result.uploadURL };
	}
);
