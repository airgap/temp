import { handleGetChannelSensitives } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleGetChannelSensitives(
	async (channelId, { requester, strings }) => {
		const channelBy = await pg
			.selectFrom('channelSensitives')
			.selectAll()
			.where('id', '=', channelId)
			.where('owner', '=', requester)
			.executeTakeFirst();
		if (!channelBy) {
			throw new Error(strings.youHaveNoChannelByThatId);
		}
		console.log('channel', channelBy);
		return channelBy;
	},
);
