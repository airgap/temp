import { BigIntColumnModel } from 'from-schema';
import { numberChecks } from './numberChecks';

export const mapBigintType = (
	name: string,
	columnSchema: BigIntColumnModel
): string => {
	const constraints = numberChecks(name, columnSchema);
	return `BIGINT${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};
