import { Group } from "@lyku/json-models";
import { system } from "../users";

export const lyku = {
	id: 'a129229c-c360-41d2-94b3-d7a7aae0bd60',
	name: 'Lyku',
	slug: 'lyku',
	private: false,
	creator: system.id,
	owner: system.id,
	created: '2024-01-20T05:36:36.888Z',
} satisfies Group;