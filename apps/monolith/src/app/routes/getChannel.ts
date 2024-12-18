import { monolith } from 'models';
import { useContract } from '../Contract';

export const getChannel = useContract(
	monolith.getChannel,
	async ({ name, id }, { tables, connection }, _, strings) => {
		let channelBy;
		if (id)
			channelBy = tables.channels.get(id).default({
				error: strings.channelNonexistent,
			});
		else if (name)
			channelBy = tables.channels
				.getAll(name.toLowerCase(), {
					index: 'slug',
				})(0)
				.default({
					error: strings.youHaveNoChannelByThatName,
				});
		else throw new Error(strings.invalidRequestParams);
		const res = await channelBy.run(connection);
		if (!res) {
			console.error(
				'Yo what the fuck happened, the db returned empty but it should error',
			);
			throw new Error(strings.unknownBackendError);
		}
		if ('error' in res) {
			throw new Error(res.error);
		}
		console.log('channel', res);
		return res;
	},
);
