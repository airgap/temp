import {pipe, components, revisions, cloc} from '@lyku/stats';
import { Center } from '../Center';
import { Divisio } from '../Divisio';
import * as monolith from '@lyku/mapi-models';
import { dbConfig } from '@lyku/db-config';
// import { monolith, cloudflare, linkShortener, dbConfig } from '@lyku/json-models';
import { createElement } from 'react';
import { phrasebook } from '../phrasebook';

type H = 1 | 2 | 3 | 4 | 5 | 6;

type Stat = {
	name: string;
	value: number | string;
	h?: H;
};

const statList: Stat[] = [
	{ name: 'alpha releases', value: pipe },
	{ name: 'code commits', value: revisions },
	{
		name: phrasebook.uxComponentCount,
		value: components,
	},
	{
		name: phrasebook.routeCount,
		value: [
			monolith, 
			// cloudflare, 
			// linkShortener
		]
			.map(loc => Object.keys(loc).length)
			.reduce((a, b) => a + b),
	},
	{
		name: phrasebook.tableCount,
		value: Object.keys(dbConfig.tables).length,
	},
	{
		name: phrasebook.locCount,
		value: cloc.header.n_lines.toLocaleString(),
	},
	...Object.entries(cloc)
		.filter(([k, v]) => !['header', 'SUM'].includes(k))
		.map(([k, v]) => ({
			value: 'code' in v ? v.code.toLocaleString() : 'N/A',
			name: `${phrasebook.linesOf} ${k}`,
			h: 3 as H, // this is just stupid
		})),
];

export const Stats = () => (
	<Center>
		<Divisio size={'l'} layout={'v'} alignItems={'center'}>
			<h1>Lyku 0.{pipe}</h1>
			<table>
				{statList.map(({ name, value, h = 2 }) => (
					<tr>
						<th>{createElement(`h${h}`, {}, value)}</th>
						<td>{name}</td>
					</tr>
				))}
			</table>
		</Divisio>
	</Center>
);
