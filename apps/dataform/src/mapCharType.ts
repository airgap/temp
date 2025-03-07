import { CharColumnModel } from 'from-schema';

export const mapCharType = (
	name: string,
	columnSchema: CharColumnModel
): string => {
	// console.log('mapping char', name, columnSchema, '/char');
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
			}`
		);
	}
	if (columnSchema.checks) {
		constraints.push(...columnSchema.checks.map((check) => `CHECK (${check})`));
	}
	// if (columnSchema.default !== undefined) {
	//     constraints.push(`DEFAULT '${columnSchema.default}'`);
	// }
	const length = 'length' in columnSchema ? `(${columnSchema.length})` : '';
	return `CHAR${length}${
		constraints.length ? ' ' + constraints.join(' ') : ''
	}`;
};
