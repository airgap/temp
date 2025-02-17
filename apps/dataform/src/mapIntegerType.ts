import { IntegerColumnModel } from 'from-schema';
import { numberChecks } from './numberChecks';

export const mapIntegerType = (
	name: string,
	columnSchema: IntegerColumnModel
): string => {
	const constraints = numberChecks(name, columnSchema);
	return `INTEGER${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};
