import { NumberBase } from 'from-schema/dist/postgres/columns/numeric/NumberBase';

export const numberChecks = <T extends NumberBase<bigint | number>>(
	name: string,
	columnSchema: T
) => {
	const constraints: string[] = [];
	if ('checks' in columnSchema && columnSchema.checks)
		constraints.push(...columnSchema.checks);
	if (columnSchema.minimum !== undefined) {
		constraints.push(`CHECK ("${name}" >= ${columnSchema.minimum})`);
	}
	if (columnSchema.maximum !== undefined) {
		constraints.push(`CHECK ("${name}" <= ${columnSchema.maximum})`);
	}
	if (columnSchema.multipleOf !== undefined) {
		constraints.push(`CHECK ("${name}" % ${columnSchema.multipleOf} = 0)`);
	}
	if (columnSchema.exclusiveMinimum !== undefined) {
		constraints.push(`CHECK ("${name}" > ${columnSchema.exclusiveMinimum})`);
	}
	if (columnSchema.exclusiveMaximum !== undefined) {
		constraints.push(`CHECK ("${name}" < ${columnSchema.exclusiveMaximum})`);
	}
	return constraints;
};
