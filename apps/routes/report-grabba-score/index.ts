import { handleReportGrabbaScore } from '@lyku/handles';
import { bindIds, Err } from '@lyku/helpers';
import { InsertableScore } from '@lyku/json-models';
import { Group } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { parseBON } from 'from-schema';
import { pack, unpack } from 'msgpackr';

export default handleReportGrabbaScore(
	async ({ score, bits, bytes, start, finish }, { requester, now }) => {
		const leaderboardScore = {
			user: requester ?? 0,
			reports: 0,
			columns: [score, bits, bytes],
			leaderboard: 1,
			game: 1,
			verifiers: [],
			updated: now,
			created: now,
		} satisfies InsertableScore;
		const insertedScore = await pg
			.insertInto('scores')
			.values(leaderboardScore)
			.returningAll()
			.executeTakeFirstOrThrow();
		await redis.set(`score:${insertedScore.id}`, pack(insertedScore));
	},
);
