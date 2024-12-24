import { monolith } from 'models';
import { useContract } from '../Contract';
import { getUserId } from '../getUserId';

export const listMyChannels = useContract(
	monolith.listMyChannels,
	async (_, { tables, connection }, { msg }, strings) => {
		const userId = await getUserId(msg, tables, connection);
		const channels = tables.channels
			.getAll(userId, {
				index: 'owner',
			})
			.coerceTo('array');
		const res = await channels.run(connection);
		if (!res) {
			console.error('idk wtf happened but res is undefined');
			throw new Error(strings.unknownBackendError);
		}
		if ('error' in res) throw new Error(res.error?.toString());
		console.log('channels', channels);
		return { channels: res };
	}
);
