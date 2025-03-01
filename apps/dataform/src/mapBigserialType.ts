import { BigSerialColumnModel } from 'from-schema';
import { numberChecks } from './numberChecks';

export const mapBigserialType = (
	name: string,
	columnSchema: BigSerialColumnModel,
): string => {
	const constraints = numberChecks(name, columnSchema);

	if (columnSchema.primaryKey) {
		constraints.push('PRIMARY KEY');
	}
	if (columnSchema.unique) {
		constraints.push('UNIQUE');
	}
	return `BIGSERIAL${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};
