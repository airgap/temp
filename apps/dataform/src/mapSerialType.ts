import { SerialColumnModel } from 'from-schema';
import { numberChecks } from './numberChecks';

export const mapSerialType = (
	name: string,
	columnSchema: SerialColumnModel,
): string => {
	const constraints = numberChecks(name, columnSchema);

	if (columnSchema.primaryKey) {
		constraints.push('PRIMARY KEY');
	}
	if (columnSchema.unique) {
		constraints.push('UNIQUE');
	}
	return `SERIAL${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};
