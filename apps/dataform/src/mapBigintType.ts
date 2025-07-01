import { BigIntColumnModel } from 'from-schema';
import { numberChecks } from './numberChecks';

export const mapBigintType = (
	name: string,
	columnSchema: BigIntColumnModel,
): string => {
	const constraints = numberChecks(name, columnSchema);

	if (columnSchema.primaryKey) {
		constraints.push('PRIMARY KEY');
	}
	if (columnSchema.unique) {
		constraints.push('UNIQUE');
	}
	const { generated } = columnSchema;
	if (generated) {
		const when = generated.always ? 'ALWAYS' : 'BY DEFAULT';
		constraints.push(`GENERATED ${when} AS IDENTITY`);
	}
	return `BIGINT${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};
