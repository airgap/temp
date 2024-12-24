import { now } from 'rethinkdb';

import { useContract } from '../Contract';
import * as crypto from 'crypto';
import { Insertable } from '../types/Insertable';
import { delayAttack } from '../delayAttack';
import { ttfBots } from '../internalUsers';
import { FromSchema } from 'from-schema';
import { ttfMatch, guestUser, monolith } from 'models';

export const newAiTtfMatch = useContract(
	monolith.newAiTtfMatch,
	async (mode, { tables, connection }, { userId }) => {
		console.log('Creating', mode, 'AI match');
		const botId = ttfBots[mode].user.id;
		userId ??= guestUser.id;
		const amX = Boolean(crypto.randomInt(0, 2));
		const match: Insertable<FromSchema<typeof ttfMatch>> = {
			X: amX ? userId : botId,
			O: amX ? botId : userId,
			board: '---------',
			turn: 1,
			created: now(),
		};
		const m = await tables.ttfMatches
			.insert(match, { returnChanges: true })('changes')(0)('new_val')
			.run(connection);
		if (!amX) void delayAttack(m.id, tables, connection);
		return m;
	}
);
