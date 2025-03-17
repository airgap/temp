<script lang="ts">
	import Airtable, { FieldSet, Records } from 'airtable';
	import { onMount } from 'svelte';
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
		},
	};

	const findUnmetDependency = (row: Row, rows: Records<FieldSet>) =>
		rows.find(
			(r) =>
				r.fields['Status'] !== 'Done' &&
				row.fields['Dependencies']?.includes(r.id),
		);

	const getCat = (row: Row, rows: Records<FieldSet>): Cat =>
		({
			Done: 'Done',
			'In progress': 'Working',
			Todo: findUnmetDependency(row, rows) ? 'Blocked' : 'Ready',
		})[row.fields['Status'] as StatusType] as Cat;

	const lengthOrZero = (thing?: unknown) =>
		Array.isArray(thing) ? thing.length : 0;

	type SetNode = { id: string; label: string; group: string };

	let netref: HTMLDivElement;
	let network: Network;
	let rows: Records<FieldSet>;
	let nodeList: SetNode[];
	let shown: SetNode[] = [];

	onMount(async () => {
		if (!netref) throw new Error('Network reference not found');

		network = new Network(
			netref,
			{
				nodes: [],
				edges: [],
			},
			options,
		);

		rows = await table.select().firstPage();

		network.once('stabilized', function () {
			network.moveTo({ scale: 1 });
		});

		if (!rows || !network) return;

		nodeList = Array.from(rows)
			.sort(
				(a, b) =>
					lengthOrZero(a.fields['Dependencies']) -
					lengthOrZero(b.fields['Dependencies']),
			)
			.map((row) => ({
				id: row.id,
				label: `*${row.fields['Name']}*`,
				group: getCat(row as unknown as Row, rows),
			}));

		const nodes = new DataSet<SetNode>([]);

		const edgettes = rows
			.flatMap((row) =>
				(row.fields['Dependencies'] as string[])?.map((id) => ({
					to: row.id,
					from: id,
				})),
			)
			.filter((a) => a);

		const edges = new DataSet<{ id?: string; to: string; from: string }>(
			edgettes,
		);

		network.setData({ nodes, edges });
	});

	function click(c: Cat) {
		if (!nodeList || !network) return;

		network.fit({
			nodes: shown.filter((n) => n.group === c).map(({ id }) => id),
			animation: {
				easingFunction: 'easeInOutCubic',
				duration: 1000,
			},
		});
		console.log('refit');
	}
</script>

<TvBox>
	<div class={styles.TvFrame}>
		<div class={styles.graph} bind:this={netref} />
		{#if !nodeList?.length}
			<h2>Loading...</h2>
		{/if}
	</div>
	<ul class={styles.legend}>
		{#each cats as c}
			<li>
				<button
					onclick={() => click(c)}
					style="background-color: {catMap[c].color}"
				>
					{catMap[c].title}
				</button>
			</li>
		{/each}
	</ul>
</TvBox>
