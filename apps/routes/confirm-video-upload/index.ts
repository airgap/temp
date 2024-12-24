import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { run } from '@lyku/route-helpers';
import { handleConfirmVideoUpload } from '@lyku/handles';

export const confirmVideoUpload = handleConfirmVideoUpload(
	async (id, { db, requester, strings }) => {
		console.log('Confirming image upload', id);
		if (!cfApiToken)
			throw new Error('We forgot to enter our Cloudflare password');

		const videoUpload = await db
			.selectFrom('videoDrafts')
			.selectAll()
			.where('id', '=', id)
			.where('user', '=', requester)
			.executeTakeFirst();

		if (!videoUpload) {
			throw new Error(strings.youHaveNoChannelByThatId);
		}

		console.log('WHORE', cfAccountId, id);

		const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${id}`;
		const command = `curl --request GET \\
    --url ${url} \\
    --header 'Content-Type: application/json' \\
    --header 'Authorization: Bearer ${cfApiToken}'`;
		const { stdout } = await run(command);
		const cfres = JSON.parse(stdout);
		console.log('CFRES', cfres);

		if (!cfres.success) throw new Error(strings.videoUploadAuthorizationError);

		const dbres = await db
			.insertInto('videos')
			.values({
				...cfres.result,
				id,
				authorId: requester,
				supertype: 'video',
				uploaded: new Date(),
				...(videoUpload.channel ? { channelId: videoUpload.channel } : {}),
			})
			.returning('id')
			.executeTakeFirst();

		console.log('dbres', dbres);

		if (!dbres) throw new Error(strings.unknownBackendError);

		// return dbres.id;
	}
);
