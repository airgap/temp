import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { run } from '@lyku/route-helpers';
import { handleConfirmVideoUpload } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleConfirmVideoUpload(
	async (id, { requester, strings }) => {
		console.log('Confirming image upload', id);
		if (!cfApiToken)
			throw new Err(500, 'We forgot to enter our Cloudflare password');

		const videoUpload = await pg
			.selectFrom('videoDrafts')
			.selectAll()
			.where('id', '=', id)
			.where('user', '=', requester)
			.executeTakeFirst();

		if (!videoUpload) {
			throw new Err(404, strings.youHaveNoChannelByThatId);
		}

		console.log('WHORE', cfAccountId, id);

		const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${id}`;
		const command = `curl --request GET \\
    --url ${url} \\
    --header 'Content-Type: application/json' \\
    --header 'Authorization: Bearer ${cfApiToken}'`;
		const { stdout } = await run(command) as any;
		const cfres = JSON.parse(stdout);
		console.log('CFRES', cfres);

		if (!cfres.success)
			throw new Err(500, strings.videoUploadAuthorizationError);

		const dbres = await pg
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

		if (!dbres) throw new Err(500, strings.unknownBackendError);

		// return dbres.id;
	},
);
