import { takeAiTtfMove } from './takeAiTtfMove';
import { delay } from '@lyku/helpers';
import type { Database } from '@lyku/db-types';
import type { Kysely } from 'kysely';

export const delayAttack = async (matchId: bigint, db: Kysely<Database>) => {
	const match = await db
		.selectFrom('ttfMatches')
		.selectAll()
		.where('id', '=', matchId)
		.executeTakeFirstOrThrow();
	await delay(2000);
	console.log('Finished waiting. Taking AI move...');
	takeAiTtfMove(match);
	console.log('Stamping date...');
	console.log('Committing attack...');
	await db
		.updateTable('ttfMatches')
		.set(match)
		.where('id', '=', matchId)
		.execute();
	console.log('AI attacked.');
};
