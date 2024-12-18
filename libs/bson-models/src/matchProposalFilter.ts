import { EnumColumnModel } from 'from-schema';

export const matchProposalFilter = {
	type: 'enum',
	enum: ['sent', 'received'],
} as const satisfies EnumColumnModel;
