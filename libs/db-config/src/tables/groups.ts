import { TableModel } from 'from-schema';
import { Group, group } from 'bson-models';
import { systemUser } from '../internalUsers';

const betaGroup = {
	id: 'a129229c-c360-41d2-94b3-d7a778e0bd60',
	name: 'Beta',
	slug: 'beta',
	private: false,
	creator: systemUser.id,
	owner: systemUser.id,
	created: '2024-01-20T05:36:36.888Z',
} satisfies Group;

const lykuGroup = {
	id: 'a129229c-c360-41d2-94b3-d7a7aae0bd60',
	name: 'Lyku',
	slug: 'lyku',
	private: false,
	creator: systemUser.id,
	owner: systemUser.id,
	created: '2024-01-20T05:36:36.888Z',
} satisfies Group;
export const groups = {
	indexes: ['name', 'slug', 'owner', 'creator', 'created', 'private'],
	schema: group,
	docs: [betaGroup, lykuGroup],
} satisfies TableModel<typeof group>;
