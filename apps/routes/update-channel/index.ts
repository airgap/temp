import { handleUpdateChannel } from '@lyku/handles';
import { Channel } from '@lyku/json-models';

export default handleUpdateChannel(
	async (
		{ id, name, tagline, bio, bgColor, fgColor, tvColor },
		{ db, requester, strings },
	) => {
		const partial = Object.fromEntries(
			Object.entries({
				name,
				tagline,
				bio,
				bgColor,
				fgColor,
				tvColor,
			}).filter(([, v]) => typeof v !== 'undefined'),
		) as Partial<Channel>;

		console.log('Partial channel update', partial);

		const updatedChannel = await db
			.updateTable('channels')
			.set(partial)
			.where('id', '=', id)
			.where('owner', '=', requester)
			.returningAll()
			.executeTakeFirstOrThrow();

		if (!updatedChannel) {
			throw new Error(strings.youHaveNoChannelByThatId);
		}

		return updatedChannel;
	},
);
