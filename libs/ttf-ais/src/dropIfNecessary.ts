import type { TtfMatch } from '@lyku/json-models';

export const dropIfNecessary = (match: TtfMatch) => {
	if (match.turn % 3 === 1) match.board = '---' + match.board.substring(0, 6);
	return match;
};
