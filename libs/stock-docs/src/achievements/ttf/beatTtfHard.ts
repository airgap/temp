import type { Achievement } from '@lyku/json-models';
import { hardTtfBot } from '../../users';
import { ticTacFlow } from '../../games';

export const beatTtfHard = {
	points: 40,
	id: 13n,
	name: 'Hardly Trying',
	description: 'Win a game against the Hard AI',
	icon: hardTtfBot.profilePicture,
	game: ticTacFlow.id,
} as const satisfies Achievement;
