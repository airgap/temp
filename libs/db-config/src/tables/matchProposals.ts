import { PostgresTableModel } from 'from-schema';
import { matchProposal } from 'bson-models';

export const matchProposals = {
	indexes: ['from', 'to', 'created'],
	schema: matchProposal,
} as const satisfies PostgresTableModel<typeof matchProposal>;
