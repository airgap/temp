import { BigSerialColumnModel } from 'from-schema';
import { numberChecks } from './numberChecks';

export const mapBigserialType = (
	name: string,
	columnSchema: BigSerialColumnModel
): string => {
	const constraints = numberChecks(name, columnSchema);
	return `BIGSERIAL${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};
