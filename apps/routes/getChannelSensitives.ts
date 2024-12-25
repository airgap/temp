import { monolith } from 'models';
import { useContract } from '../Contract';
export const getChannelSensitives = useContract(
	monolith.getChannelSensitives,
	async (channelId, { tables, connection }, { userId }, strings) => {
		const channelBy = tables.channels.get(channelId).do((v) =>
			v
				.and(v('owner').eq(userId))
				.branch(tables.channelSensitives.get(channelId), {
					error: strings.youHaveNoChannelByThatId,
				})
		);
		const res = await channelBy.run(connection);
		if ('error' in res) {
			throw new Error(res.error);
		}
		console.log('channel', res);
		return res;
	}
);
