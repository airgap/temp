import * as crypto from 'crypto';
import { delayAttack } from '@lyku/route-helpers';
import { ttfBots } from '../internalUsers';
import { handleNewAiTtfMatch } from '@lyku/handles';
import { TtfMatch } from '@lyku/json-models';
import { Insertable } from 'kysely';

export default handleNewAiTtfMatch(
	async (mode, { db, requester }) => {
		console.log('Creating', mode, 'AI match');
		const botId = ttfBots[mode].user.id;
		const amX = Boolean(crypto.randomInt(0, 2));
		const match: Insertable<TtfMatch> = {
			X: amX ? userId : botId,
			O: amX ? botId : userId,
			board: '---------',
			turn: 1,
			created: now(),
		};
		const m = await db.insertInto('ttfMatches').values(match).executeTakeFirstOrThrow();
		if (!amX) void delayAttack(m.id, tables, connection);
		return m;
	}
);
