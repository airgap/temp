import { BigIntColumnModel } from 'from-schema';
import { numberChecks } from './numberChecks';

export const mapBigintType = (
	name: string,
	columnSchema: BigIntColumnModel
): string => {
	const constraints = numberChecks(name, columnSchema);

	if (columnSchema.primaryKey) {
		constraints.push('PRIMARY KEY');
	}
	if (columnSchema.unique) {
		constraints.push('UNIQUE');
	}
	return `BIGINT${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};
