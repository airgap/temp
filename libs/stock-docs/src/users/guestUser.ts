import type { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const guestUser = {
	bot: true,
	chatColor: 'FFFFFF',
	id: 1n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuGuest',
	profilePicture: '/bots/grin-zoom.png',
	points: 0n,
	slug: 'lykuguest',
	staff: true,
	groupLimit: 0,
	lastSuper: defaultDate,
	created: defaultDate,
} as const satisfies User;
