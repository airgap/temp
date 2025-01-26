import {
	ttfBotsById,
	ttfBots,
	grantPointsToUser,
	grantAchievementToUser,
	placePieceInMatch,
	checkWin,
	delayAttack,
	dropIfNecessary,
} from '@lyku/route-helpers';
import { TtfMatch } from '@lyku/json-models';
import { users, achievements } from '@lyku/stock-docs';
import { handlePlacePiece } from '@lyku/handles';

const isValidTicTacFlowMove = (
	{ board, turn, winner }: TtfMatch,
	who: 'X' | 'O',
	where: number
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
	async ({ match: matchId, square }, { db, requester }) => {
		const match = await db
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
			square
		);
		if (!canPlace) throw new Error('You Fucknut you cant do that haha');
		placePieceInMatch(iAm, square, match);
		if (checkWin(match.board, iAm)) {
			match.winner = requester;
			console.log(match.winner, 'won!');
			void grantPointsToUser(
				ttfBotsById.get(oppId)?.points ?? 1,
				requester,
				db
			);
			const achievement = achievementMap.get(oppId);
			if (!achievement) console.log('No achievement to grant');
			else void grantAchievementToUser(achievement, requester, db);
		} else {
			dropIfNecessary(match);
			void delayAttack(matchId, db);
		}
		match.lastTurn = new Date();
		await db
			.updateTable('ttfMatches')
			.set(match)
			.where('id', '=', matchId)
			.execute();
	}
);
