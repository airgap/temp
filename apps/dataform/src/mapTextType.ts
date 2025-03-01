import { TextColumnModel } from 'from-schema';

export const mapTextType = (
	name: string,
	columnSchema: TextColumnModel,
): string => {
	// console.log('mapping text', name, columnSchema, '/text');
	const constraints: string[] = [];

	if (columnSchema.primaryKey) {
		constraints.push('PRIMARY KEY');
	}
	if (columnSchema.unique) {
		constraints.push('UNIQUE');
	}
	if (columnSchema.generated) {
		constraints.push(
			`GENERATED ALWAYS AS (${columnSchema.generated.as})${
				columnSchema.generated.stored ? ' STORED' : ''
			}`,
		);
	}
	if (columnSchema.checks) {
		constraints.push(...columnSchema.checks.map((check) => `CHECK (${check})`));
	}
	if (columnSchema.maxLength) {
		constraints.push(`CHECK (length("${name}") <= ${columnSchema.maxLength})`);
	}
	if (columnSchema.minLength) {
		constraints.push(`CHECK (length("${name}") >= ${columnSchema.minLength})`);
	}
	// if (columnSchema.default !== undefined) {
	//     constraints.push(`DEFAULT '${columnSchema.default}'`);
	// }
	const length = 'length' in columnSchema ? `(${columnSchema.length})` : '';
	return `TEXT${length}${
		constraints.length ? ' ' + constraints.join(' ') : ''
	}`;
};
