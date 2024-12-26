import { handleGetChannel } from '@lyku/handles';

export const getChannel = handleGetChannel(async (params, { db, strings }) => {
	const selection = db.selectFrom('channels').selectAll();
	const channelBy =
		'id' in params
			? selection.where('id', '=', params.id)
			: selection.where('slug', '=', params.name.toLowerCase());
	const res = await channelBy.executeTakeFirst();
	if (!res) {
		throw new Error(strings.youHaveNoChannelByThatName);
	}
	return res;
});
