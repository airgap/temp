import { BoardWithCountdown, Player } from './Player';
import { placePieceInMatch } from './placePieceInMatch';
import { checkWin } from './checkWin';
import { dropIfNecessary } from './dropIfNecessary';
import { ttfBotsById } from './internalUsers';
import { TtfMatch } from '@lyku/json-models';

export const takeAiTtfMove = (match: TtfMatch) => {
	const iAm = 'XO'[(match.turn + 1) % 2] as Player;
	// let square: MaybeMove;
	const ttd = 3 - ((match.turn - 1) % 3);
	const key = match.board + ttd;
	console.log('turns til drop', ttd, 'key', key);
	const myId = match[iAm];
	console.log('myId', myId, ttfBotsById);
	const bot = ttfBotsById.get(myId);
	if (!bot) throw 'Bot ID not recognized';
	const ai = bot.ai;
	const square = ai(`${match.board}${ttd}` as BoardWithCountdown, iAm);
	console.log('AI selected square', square);
	if (square === null) throw 'AI returned null';
	placePieceInMatch(iAm, square, match);
	if (checkWin(match.board, iAm)) match.winner = match[iAm];
	else dropIfNecessary(match);
};
