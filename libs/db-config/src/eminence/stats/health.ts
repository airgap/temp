import { UnitStat } from '../unitStat';

export const health = {
	name: 'Health',
	minimum: 0,
	maximum: 4,
	base: 3,
} as const satisfies UnitStat;
