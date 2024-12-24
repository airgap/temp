import { user, monolith } from 'models';

import { useContract } from '../Contract';
import { FromSchema } from 'from-schema';

export const updateChannel = useContract(
	monolith.updateChannel,

	async (
		{ id, name, tagline, bio, bgColor, fgColor, tvColor },
		{ tables, connection },
		{ userId },
		strings
	) => {
		const partial = Object.fromEntries(
			Object.entries({
				name,
				tagline,
				bio,
				bgColor,
				fgColor,
				tvColor,
			}).filter(([, v]) => typeof v !== 'undefined')
		) as Partial<FromSchema<typeof user>>;
		console.log('Partial channel update', partial);
		const channel = tables.channels.get(id);
		const updateChannel = channel.update(partial, { returnChanges: true });
		const maybeUpdate = channel
			.and(channel('owner').eq(userId))
			.branch(updateChannel, null);
		const res = await maybeUpdate.run(connection);
		if (!res) {
			throw new Error(strings.youHaveNoChannelByThatId);
		}
		if (res.replaced !== 1 || res.changes.length !== 1)
			throw new Error(strings.unknownBackendError);
		// console.log('channel', res);
		return res.changes[0].new_val;
	}
);
