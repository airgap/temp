// import { FromSchema, ObjectSchema } from 'from-schema';
// import { uuid } from '../uuid';
// import { number, string } from 'from-schema';
// import { unitStat } from './unitStat';
// import { operation } from './operation';

// export const modifier = {
// 	type: 'object',
// 	properties: {
// 		id: uuid,
// 		name: string,
// 		stat: unitStat.properties.id,
// 		operation,
// 		amount: number,
// 	},
// 	required: ['id', 'name', 'stat', 'operation'],
// } as const satisfies ObjectSchema;
// export type Modifier = FromSchema<typeof modifier>;
