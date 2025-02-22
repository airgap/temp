import { TimestamptzColumnModel } from 'from-schema';
import { timestampChecks } from './numberChecks';
import { dateToPostgresString } from './dateToPostgresString';
export const mapTimestamptzType = (
	name: string,
	columnSchema: BigIntColumnModel
): string => {
	const constraints = timestampChecks(name, columnSchema);

	if (columnSchema.primaryKey) {
		constraints.push('PRIMARY KEY');
	}
	if (columnSchema.unique) {
		constraints.push('UNIQUE');
	}
	const { default: d } = columnSchema;
	const defaultType = typeof d;
	if (defaultType === 'object') {
		const sql =
			typeof d === 'object' &&
			Object.keys(d).length === 1 &&
			'sql' in d &&
			typeof d.sql === 'string' &&
			d.sql;
		constraints.push(`DEFAULT ${sql || "'" + dateToPostgresString(d) + "'"}`);
	}
	return `TIMESTAMPTZ${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};
