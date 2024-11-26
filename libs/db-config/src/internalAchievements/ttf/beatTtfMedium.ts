import { mediumTtfBot } from '../../internalUsers';
import { Achievement } from '@lyku/json-models';
import { ticTacFlow } from '../../internalGames';

export const beatTtfMedium = {
	points: 30,
	id: 'b81d8094-56af-4bb8-81e9-f2cae7bc46f9',
	name: 'TTF at a Medium Pace',
	description: 'Win a game against the Medium AI',
	icon: mediumTtfBot.profilePicture,
	game: ticTacFlow.id,
} as const satisfies Achievement;
