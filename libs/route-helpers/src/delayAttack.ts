import { takeAiTtfMove } from './takeAiTtfMove';
import { delay } from '@lyku/helpers';
import { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';

export const delayAttack = async (
	matchId: bigint,
	db: Kysely<Database>,
	requester: bigint
) => {
	const match = await db.selectFrom('ttfMatches').selectAll().where('id', '=', matchId).executeTakeFirstOrThrow();
	await delay(2000);
	console.log('Finished waiting. Taking AI move...');
	takeAiTtfMove(match);
	console.log('Stamping date...');
	match.lastTurn = new Date();
	console.log('Committing attack...');
	await db.updateTable('ttfMatches').set({ lastTurn: match.lastTurn }).where('id', '=', matchId).execute();
	console.log('AI attacked.');
};
