import { easyTtfBot } from '../../users';
import { Achievement } from '@lyku/json-models';
import { ticTacFlow } from '../../games';

export const beatTtfEasy = {
	points: 20,
	id: 11n,
	name: 'Easy Peasy',
	description: 'Win a game against the Easy AI',
	icon: easyTtfBot.profilePicture,
	game: ticTacFlow.id,
} as const satisfies Achievement;
