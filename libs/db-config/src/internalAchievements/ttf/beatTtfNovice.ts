import { noviceTtfBot } from '../../internalUsers';
import { Achievement } from '@lyku/json-models';
import { ticTacFlow } from '../../internalGames';

export const beatTtfNovice = {
	points: 10,
	id: '9a0e89b1-3d22-48b9-9c52-14dfbd24797c',
	name: "Beginner's Luck",
	description: 'Win a game against the Novice AI',
	icon: noviceTtfBot.profilePicture,
	game: ticTacFlow.id,
} as const satisfies Achievement;
