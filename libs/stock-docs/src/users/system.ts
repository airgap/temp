import { User } from '@lyku/json-models';
export const system = {
  banned: false,
  bot: true,
  chatColor: 'FFFFFF',
  confirmed: false,
  id: 0n,
  joined: new Date('2024-01-20T05:36:36.888Z'),
  lastLogin: new Date('2024-01-20T05:36:36.888Z'),
  live: false,
  postCount: 0n,
  username: 'lykuSystem',
  profilePicture: '/bots/smile-zoom.png',
  points: 0,
  slug: 'system',
  staff: true,
} as const satisfies User;
