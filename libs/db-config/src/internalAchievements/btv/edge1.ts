import { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../internalGames';

export const edge1 = {
	points: 10,
	id: '9648665f-a1db-4e1d-bc93-e988c2137d71',
	name: 'Walled In',
	description: 'Get an edge shot playing Bouncing TV',
	icon: '/levels/1.png',
	game: bouncingTv.id,
} as const satisfies Achievement;
