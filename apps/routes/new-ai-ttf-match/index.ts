import * as crypto from 'crypto';
import { delayAttack, ttfBots } from '@lyku/route-helpers';
import { handleNewAiTtfMatch } from '@lyku/handles';
import { client as db } from '@lyku/postgres-client';

export default handleNewAiTtfMatch(async (mode, { requester }) => {
	console.log('Creating', mode, 'AI match');
	const botId = ttfBots[mode].user.id;
	const amX = Boolean(crypto.randomInt(0, 2));
	const m = await db
		.insertInto('ttfMatches')
		.values({
			X: amX ? requester : botId,
			O: amX ? botId : requester,
			board: '---------',
			turn: 1,
			created: new Date(),
		})
		.returningAll()
		.executeTakeFirstOrThrow();
	if (!amX) void delayAttack(m.id, db);
	return m;
});
