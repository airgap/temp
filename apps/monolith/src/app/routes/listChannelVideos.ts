import { FromSchema } from 'from-schema';
import { monolith } from '@lyku/json-models';

import { useContract } from '../Contract';
import { cfAccountId, cfApiToken } from '../env';
import { run } from '../run';
import { CloudflareVideoDoc } from '@lyku/json-models';

export const listChannelVideos = useContract(
	monolith.listChannelVideos,
	async ({ channelId }, { tables, connection }, _, strings) => {
		if (!cfApiToken)
			throw new Error('We forgot to enter our Cloudflare password');
		const channel = await tables.channels.get(channelId).run(connection);

		if (channel === null) throw new Error(strings.channelNonexistent);
		console.log('SLUT');

		const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream?creator=${channelId}&limit=20&asc=false&status=ready`;
		const command = `curl --request GET \\
    --url '${url}' \\
    --header 'Authorization: Bearer ${cfApiToken}' \\
    --header 'Content-Type: application/json'`;
		const { stdout } = await run(command);
		const cfres = JSON.parse(stdout); // as getVideosByCreatorId['response'];
		console.log('CFRES', cfres);
		if (!cfres.success) throw new Error(strings.unknownBackendError);
		return cfres.result as CloudflareVideoDoc[];
	},
);
