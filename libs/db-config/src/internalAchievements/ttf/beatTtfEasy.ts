import { easyTtfBot } from '../../internalUsers';
import { Achievement } from '@lyku/json-models';
import { ticTacFlow } from '../../internalGames';

export const beatTtfEasy = {
	points: 20,
	id: '122555ef-9fb2-46e7-bac9-41b6f8391188',
	name: 'Easy Peasy',
	description: 'Win a game against the Easy AI',
	icon: easyTtfBot.profilePicture,
	game: ticTacFlow.id,
} as const satisfies Achievement;
