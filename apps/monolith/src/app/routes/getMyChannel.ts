import { monolith } from 'models';
import { useContract } from '../Contract';

export const getMyChannel = useContract(
	monolith.getMyChannel,
	async ({ name, id }, { tables, connection }, { userId }, strings) => {
		let channelBy;
		if (id)
			channelBy = tables.channels.get(id).do((v) =>
				v.and({ owner: userId }).branch(v, {
					error: strings.youHaveNoChannelByThatId,
				})
			);
		else if (name)
			channelBy = tables.channels
				.getAll(name, {
					index: 'name',
				})
				.filter<false>({ owner: userId })(0)
				.default({
					error: strings.youHaveNoChannelByThatName,
				});
		else throw new Error(strings.invalidRequestParams);
		const query = channelBy;
		const res = await query.run(connection);
		if (!res) {
			console.error(
				'Yo what the fuck happened, the db returned empty but it should error'
			);
			throw new Error(strings.unknownBackendError);
		}
		if ('error' in res) {
			throw new Error(res.error);
		}
		console.log('channel', res);
		return res;
	}
);
