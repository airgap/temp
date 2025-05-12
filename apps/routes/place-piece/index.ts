import { grantPointsToUser, grantAchievementToUser } from '@lyku/route-helpers';
import {
	ttfBotsById,
	ttfBots,
	delayAttack,
	dropIfNecessary,
	placePieceInMatch,
	checkWin,
} from '@lyku/ttf-ais';
import { client as pg } from '@lyku/postgres-client';
import { TtfMatch } from '@lyku/json-models';
import { users, achievements } from '@lyku/stock-docs';
import { handlePlacePiece } from '@lyku/handles';

const isValidTicTacFlowMove = (
	{ board, turn, winner }: TtfMatch,
	who: 'X' | 'O',
	where: number,
): boolean => {
	if (winner) return false;
	if (board[where] !== '-') return false;
	if ('XO'[turn % 2] === who) return false;
	return true;
};
const achievementMap: Map<
	(typeof ttfBots)[keyof typeof ttfBots]['user']['id'],
	(typeof achievements)[keyof typeof achievements]['id']
> = new Map([
	//novice
	[users.noviceTtfBot.id, achievements.beatTtfNovice.id],
	//easy
	[users.easyTtfBot.id, achievements.beatTtfEasy.id],
	//medium
	[users.mediumTtfBot.id, achievements.beatTtfMedium.id],
	//hard
	[users.hardTtfBot.id, achievements.beatTtfHard.id],
]);
export default handlePlacePiece(
	async ({ match: matchId, square }, { requester }) => {
		const match = await pg
			.selectFrom('ttfMatches')
			.selectAll()
			.where('id', '=', matchId)
			.executeTakeFirstOrThrow();
		const iAm = requester === match.X ? 'X' : 'O';
		const oppId = requester === match.X ? match.O : match.X;
		const canPlace = isValidTicTacFlowMove(match, iAm, square);
		console.info(
			'You are',
			iAm,
			'and',
			canPlace ? 'can' : 'cannot',
			'place a piece at',
			square,
		);
		if (!canPlace) throw new Error("You can't do that");
		placePieceInMatch(iAm, square, match);
		if (checkWin(match.board, iAm)) {
			match.winner = requester;
			console.log(match.winner, 'won!');
			void grantPointsToUser(
				ttfBotsById.get(oppId)?.points ?? 1,
				requester,
				pg,
			);
			const achievement = achievementMap.get(oppId);
			if (!achievement) console.log('No achievement to grant');
			else void grantAchievementToUser(achievement, requester, pg);
		} else {
			dropIfNecessary(match);
			void delayAttack(matchId, pg);
		}
		match.lastTurn = new Date();
		await pg
			.updateTable('ttfMatches')
			.set(match)
			.where('id', '=', matchId)
			.execute();
	},
);
