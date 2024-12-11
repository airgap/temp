import { Game } from '@lyku/json-models';
export const strategyHeron = {
  id: 3,
  title: 'Strategy Heron',
  // homepage: '/play/heron',
  status: 'planned',
  nsfw: false,
  thumbnail: '/heron.png',
} as const satisfies Game;
