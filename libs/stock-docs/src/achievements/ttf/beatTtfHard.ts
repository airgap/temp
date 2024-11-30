import { hardTtfBot } from '../../users';
import { Achievement } from 'bson-models';
import { ticTacFlow } from '../../games';

export const beatTtfHard = {
	points: 40,
	id: 'f18ad8d3-1a14-4428-b984-e120e8dc000b',
	name: 'Hardly Trying',
	description: 'Win a game against the Hard AI',
	icon: hardTtfBot.profilePicture,
	game: ticTacFlow.id,
} as const satisfies Achievement;
