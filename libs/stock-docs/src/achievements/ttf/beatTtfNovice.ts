import { noviceTtfBot } from '../../users';
import { Achievement } from '@lyku/json-models';
import { ticTacFlow } from '../../games';

export const beatTtfNovice = {
	points: 10,
	id: 10n,
	name: "Beginner's Luck",
	description: 'Win a game against the Novice AI',
	icon: noviceTtfBot.profilePicture,
	game: ticTacFlow.id,
} as const satisfies Achievement;
