import { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../internalGames';

export const corner1 = {
	points: 20,
	id: '0ed8bac9-174b-4eaf-8757-4e35e843cfeb',
	name: 'Cornered',
	description: 'Get a corner shot playing Bouncing TV',
	icon: '/levels/1.png',
	game: bouncingTv.id,
} as const satisfies Achievement;
