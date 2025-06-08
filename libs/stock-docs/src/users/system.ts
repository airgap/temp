import type { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const system = {
	bot: true,
	chatColor: 'FFFFFF',
	id: 0n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuSystem',
	name: 'Lyku System',
	profilePicture: '/bots/smile-zoom.png',
	points: 0n,
	slug: 'system',
	staff: true,
	groupLimit: 0,
	lastSuper: defaultDate,
	created: defaultDate,
} as const satisfies User;
