import { mediumTtfBot } from '../../users';
import { Achievement } from '@lyku/json-models';
import { ticTacFlow } from '../../games';

export const beatTtfMedium = {
	points: 30,
	id: 12n,
	name: 'TTF at a Medium Pace',
	description: 'Win a game against the Medium AI',
	icon: mediumTtfBot.profilePicture,
	game: ticTacFlow.id,
} as const satisfies Achievement;
