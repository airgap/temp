import type { Reaction } from './reactions';

export const reactionWorth = (type: Reaction | '') => {
	switch (type) {
		case '👍':
			return 1;
		case '👎':
			return -1;
		case '':
			return 0;
		default:
			return 5;
	}
};
