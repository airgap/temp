import { handleGetChannelSensitives } from '@lyku/handles';

export default handleGetChannelSensitives(
	async (channelId, { db, requester, strings }) => {
		const channelBy = await db
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
