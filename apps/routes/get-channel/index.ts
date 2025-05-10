import { handleGetChannel } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleGetChannel(async (params, { strings }) => {
	const selection = pg.selectFrom('channels').selectAll();
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
