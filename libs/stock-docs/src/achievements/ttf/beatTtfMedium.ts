import type { Achievement } from '@lyku/json-models';
import { mediumTtfBot } from '../../users';
import { ticTacFlow } from '../../games';
import { defaultDate } from '../../defaultDate';
export const beatTtfMedium = {
	points: 30,
	id: 12n,
	name: 'TTF at a Medium Pace',
	description: 'Win a game against the Medium AI',
	icon: mediumTtfBot.profilePicture,
	game: ticTacFlow.id,
	created: defaultDate,
} as const satisfies Achievement;
