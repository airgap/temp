import { takeAiTtfMove } from './takeAiTtfMove';
import { delay } from 'helpers';
import { ActualTables } from './types/ActualTables';
import { now, Connection } from 'rethinkdb';

export const delayAttack = async (
	matchId: string,
	tables: ActualTables,
	connection: Connection
) => {
	const doc = tables.ttfMatches.get(matchId);
	await delay(2000);
	console.log('Finished waiting. Taking AI move...');
	const match = await doc.run(connection);
	takeAiTtfMove(match);
	console.log('Stamping date...');
	match.lastTurn = now() as unknown as string;
	console.log('Committing attack...');
	await doc.update(match).run(connection);
	console.log('AI attacked.');
};
