import type { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const deleted = {
	bot: true,
	chatColor: 'FFFFFF',
	id: -2n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'deleted',
	name: '[deleted]',
	// profilePicture: '/bots/smile-zoom.png',
	points: 0n,
	slug: 'deleted',
	staff: true,
	groupLimit: 0,
	lastSuper: defaultDate,
	created: defaultDate,
} as const satisfies User;
