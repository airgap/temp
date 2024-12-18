import Airtable, { FieldSet, Records } from 'airtable';
import { useEffect, useRef, useState } from 'react';
import { TvBox } from '../TvBox';
import { DataSet } from 'vis-data/peer/esm/vis-data';
import { Network } from 'vis-network/peer/esm/vis-network';

import styles from './Roadmap.module.sass';

const AIRTABLE_API_KEY =
	'patLFd1MduyChKxpP.583a86cd753a67bd8c73bdd11142aca4dcc46798ab8f45085faa16e0c5a97c37';
type StatusType = 'Done' | 'Todo' | 'In progress';
type Row = {
	fields: { Status: StatusType; Dependencies?: string[] };
	id: string;
};
const table = new Airtable({ apiKey: AIRTABLE_API_KEY })
	.base('apparjdVJzXS2tdXs')
	.table('tblj7u4Cvn7idoUus');
// const catMap = {
// 	Done: {
// 		color: '#53BF3B',
// 	},
// 	Working: {
// 		color: '#B3B337',
// 	},
// 	Ready: {
// 		color: '#C9853E',
// 	},
// 	Blocked: {
// 		color: '#C24930',
// 	},
// };
const catMap = {
	Done: {
		color: '#A97AFF',
		title: 'Functional',
	},
	Working: {
		color: '#64E8C9',
		title: 'In progress',
	},
	Ready: {
		color: '#FFF469',
		title: 'Ready for work',
	},
	Blocked: {
		color: '#E88164',
		title: 'Blocked',
	},
};
const cats = Object.keys(catMap) as (keyof typeof catMap)[];
type Cat = keyof typeof catMap;
const options = {
	width: '100%',
	height: '100%',
	layout: {
		randomSeed: 0,
	},
	groups: catMap,
	nodes: {
		font: {
			color: 'black',
			multi: 'md',
		},
		shadow: {
			enabled: true,
			x: 0,
			y: 0,
			size: 30,
		},
	},
	edges: {
		arrows: {
			to: {
				enabled: true,
				type: 'arrow',
			},
		},
		// shadow: {
		// 	enabled: true,
		// 	x: 0,
		// 	y: 0,
		// 	size: 30
		// }
	},
};
const findUnmetDependency = (row: Row, rows: Records<FieldSet>) =>
	rows.find(
		(r) =>
			r.fields.Status !== 'Done' && row.fields.Dependencies?.includes(r.id),
	);
const getCat = (row: Row, rows: Records<FieldSet>): Cat =>
	({
		//8CFAAA
		Done: 'Done',
		'In progress': 'Working',
		Todo: findUnmetDependency(row, rows) ? 'Blocked' : 'Ready',
	})[row.fields.Status as StatusType] as Cat;
const lengthOrZero = (thing?: unknown) =>
	Array.isArray(thing) ? thing.length : 0;
type SetNode = { id: string; label: string; group: string };
export const Roadmap = () => {
	const netref = useRef<HTMLDivElement>(null);
	const [network, setNetwork] = useState<Network>();
	useEffect(() => {
		if (!netref.current) throw new Error('Fuck');
		const network = new Network(
			netref.current,
			{
				nodes: [],
				edges: [],
			},
			options,
		);
		setNetwork(network);
		void table
			.select()
			.firstPage()
			.then((rows) => setRows(rows))
			.then(() =>
				network.once('stabilized', function () {
					network.moveTo({ scale: 1 });
				}),
			);
	}, []);
	const [rows, setRows] = useState<Records<FieldSet>>();
	const [nodeList, setNodeList] = useState<SetNode[]>();
	const shown: SetNode[] = [];
	useEffect(() => {
		if (!rows || !network) return;
		const nodeList = Array.from(rows)
			.sort(
				(a, b) =>
					lengthOrZero(a.fields.Dependencies) -
					lengthOrZero(b.fields.Dependencies),
			)
			.map((row) => ({
				id: row.id,
				label: `*${row.fields.Name}*`,
				// color: catMap[cat].color,
				group: getCat(row as unknown as Row, rows),
				// dependsOn: row.fields.Dependencies ?? []
			}));
		setNodeList(nodeList);
		const nodes = new DataSet<SetNode>([]);
		// console.log(nodeList);
		const edgettes = rows
			.flatMap((row) =>
				(row.fields.Dependencies as string[])?.map((id) => ({
					to: row.id,
					from: id,
					// color: rows.find(({id, fields: {Status}}) => ),
				})),
			)
			.filter((a) => a);
		console.log(edgettes);
		const edges = new DataSet<{ id?: string; to: string; from: string }>(
			edgettes,
		);
		// Create a new graph
		network.setData({ nodes, edges });
		// (async () => {
		// 	const count = nodeList.length;
		// 	for (let n = 0; n < count; n++) {
		// 		nodes.add(nodeList[n]);
		// 		shown.push(nodeList[n]);
		// 		await nothing(100);
		// 	}
		// })();
	}, [rows, network]);
	const click = (c: Cat) =>
		nodeList &&
		network?.fit({
			nodes: shown.filter((n) => n.group === c).map(({ id }) => id),
			animation: {
				easingFunction: 'easeInOutCubic',
				duration: 1000,
			},
		}) &&
		console.log('refit');
	return (
		<TvBox>
			<div className={styles.TvFrame}>
				<div className={styles.graph} ref={netref} />
				{!nodeList?.length && <h2>Loading...</h2>}
			</div>
			<ul className={styles.legend}>
				{cats.map((c) => (
					<li key={c}>
						<button
							onClick={() => click(c)}
							style={{ backgroundColor: catMap[c].color }}
						>
							{catMap[c].title}
						</button>
					</li>
				))}
			</ul>
		</TvBox>
	);
};
