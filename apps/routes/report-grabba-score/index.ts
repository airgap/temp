import { handleReportGrabbaScore } from '@lyku/handles';
import { bindIds, Err } from '@lyku/helpers';
import { ElasticLeaderboardService } from '@lyku/route-helpers';
import { InsertableScore } from '@lyku/json-models';
import { Group } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { parseBON } from 'from-schema';
import { pack, unpack } from 'msgpackr';

export default handleReportGrabbaScore(
	async ({ score, bits, bytes, start, finish }, { requester, now }) => {
		const leaderboardScore = {
			user: requester ?? 0n,
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
		const buff = await redis.getBuffer(`grabbaHighScore:user:${requester}`);
		const cachedHighScore = buff && unpack(buff);
		const oldHighScore =
			cachedHighScore ??
			(
				await ElasticLeaderboardService.getLeaderboard(1n, {
					user: requester,
					limit: 1,
				})
			)?.scores[0];
		if (!oldHighScore) {
			await redis.set(`grabbaHighScore:user:${requester}`, pack(insertedScore));
		} else if (oldHighScore.columns[0] < insertedScore.columns[0]) {
			await redis.set(`grabbaHighScore:user:${requester}`, pack(insertedScore));
		} else if (
			oldHighScore.columns[0] >= insertedScore.columns[0] &&
			!cachedHighScore
		) {
			await redis.set(`grabbaHighScore:user:${requester}`, pack(oldHighScore));
		}

		// Sync to Elasticsearch for leaderboard queries
		await ElasticLeaderboardService.syncScore({
			id: insertedScore.id,
			user: insertedScore.user || 0n,
			leaderboard: insertedScore.leaderboard,
			columns: insertedScore.columns,
			created: insertedScore.created,
			updated: insertedScore.updated,
			game: insertedScore.game || 1,
			deleted: insertedScore.deleted
				? new Date(insertedScore.deleted)
				: undefined,
		});
	},
);
