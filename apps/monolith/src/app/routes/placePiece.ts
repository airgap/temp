import { useContract } from '../Contract';
import { getUserId } from '../getUserId';
import { checkWin } from '../checkWin';
import { now } from 'rethinkdb';
import { dropIfNecessary } from '../dropIfNecessary';
import { placePieceInMatch } from '../placePieceInMatch';
import { delayAttack } from '../delayAttack';
import { ttfBotsById, ttfBots } from '../internalUsers';
import { FromSchema } from 'from-schema';
import { ttfMatch, guestUser, monolith } from 'models';
import { grantPointsToUser } from '../grantPointsToUser';
import { grantAchievementToUser } from '../grantAchievementToUser';
import * as achievements from 'models/internalAchievements/ttf';

const isValidTicTacFlowMove = (
	{ board, turn, winner }: FromSchema<typeof ttfMatch>,
	who: 'X' | 'O',
	where: number
) => {
	if (winner) return false;
	if (board[where] !== '-') return false;
	if ('XO'[turn % 2] === who) return false;
	return true;
};
const achievementMap: Record<
	(typeof ttfBots)[keyof typeof ttfBots]['user']['id'],
	(typeof achievements)[keyof typeof achievements]['id']
> = {
	//novice
	'78f5e918-a346-4b04-bfc4-aaaaaaaaaaab':
		'9a0e89b1-3d22-48b9-9c52-14dfbd24797c',
	//easy
	'78f5e918-a346-4b04-bfc4-aaaaaaaaaaac':
		'122555ef-9fb2-46e7-bac9-41b6f8391188',
	//medium
	'78f5e918-a346-4b04-bfc4-aaaaaaaaaaae':
		'b81d8094-56af-4bb8-81e9-f2cae7bc46f9',
	//hard
	'78f5e918-a346-4b04-bfc4-aaaaaaaaaaad':
		'f18ad8d3-1a14-4428-b984-e120e8dc000b',
};
export const placePiece = useContract(
	monolith.placePiece,
	async ({ matchId, square }, state, { msg }) => {
		const { tables, connection } = state;
		const userId = await getUserId(msg, tables, connection).catch(
			() => guestUser.id
		);
		// let query = tables.posts.orderBy(desc('published')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		const match = await tables.ttfMatches.get(matchId).run(connection);
		const iAm = userId === match.X ? 'X' : 'O';
		const oppId = userId === match.X ? match.O : match.X;
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
			match.winner = userId;
			console.log(match.winner, 'won!');
			if (userId !== guestUser.id) {
				void grantPointsToUser(ttfBotsById[oppId].points ?? 1, userId, state);
				const achievement = achievementMap[oppId];
				if (!achievement) console.log('No achievement to grant');
				else void grantAchievementToUser(achievement, userId, state);
			}
		} else {
			dropIfNecessary(match);
			void delayAttack(matchId, tables, connection);
		}
		match.lastTurn = now() as unknown as string;
		await tables.ttfMatches.get(matchId).update(match).run(connection);
		return {};
	}
);
