import { ArrayColumnModel } from 'from-schema';
import { mapColumnType } from './mapColumnType';

export const mapArrayType = (
	name: string,
	columnSchema: ArrayColumnModel,
): string => {
	const itemType = mapColumnType(name, columnSchema.items);
	const constraints: string[] = [];

	if (columnSchema.primaryKey) {
		constraints.push('PRIMARY KEY');
	}
	if (columnSchema.unique) {
		constraints.push('UNIQUE');
	}
	if (columnSchema.minItems !== undefined) {
		constraints.push(
			`CHECK (array_length("${name}", 1) >= ${columnSchema.minItems})`,
		);
	}
	if (columnSchema.maxItems !== undefined) {
		constraints.push(
			`CHECK (array_length("${name}", 1) <= ${columnSchema.maxItems})`,
		);
	}
	const matches = /^([^ ]+)(?: (.+))?$/.exec(itemType);
	if (!matches) throw new Error('Array mapping error');
	const [, itemMainType, itemRestType] = matches;
	return `${itemMainType}[] ${itemRestType ?? ''}${
		constraints.length ? ' ' + constraints.join(' ') : ''
	}`;
};
