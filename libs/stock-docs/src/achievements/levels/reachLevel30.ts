import { Achievement } from '@lyku/json-models';

export const reachLevel30 = {
  points: 0,
  id: 103n,
  name: 'Reach level 30',
  icon: '/levels/30.png',
} as const satisfies Achievement;
