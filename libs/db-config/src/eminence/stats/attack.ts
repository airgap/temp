import { UnitStat } from '../unitStat';

export const attack = {
	name: 'Attack',
	minimum: 0,
	base: 1,
} as const satisfies UnitStat;
