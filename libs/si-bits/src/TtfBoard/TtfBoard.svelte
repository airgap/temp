<script lang="ts">
	import line from '../assets/line.png';
	import linev from '../assets/linev.png';
	import { api } from '@lyku/monolith-ts-api';
	import { BoardButtons } from '../BoardButtons';
	import { Pieces } from '../Pieces';
	import { Wave } from '../Wave';
	import { Center } from '../Center';
	import { Divisio } from '../Divisio';
	import type { TtfMatch, User } from '@lyku/json-models';
	import styles from './TtfBoard.module.sass';

	const {
		match = undefined,
		overlay = undefined,
		user = undefined,
	} = $props<{
		match?: TtfMatch;
		overlay?: any;
		user?: User;
	}>();

	let pending = $state(false);

	const lines = {
		h: {
			path: line,
			fit: 'width',
			axis: 'Y',
		},
		v: {
			path: linev,
			fit: 'height',
			axis: 'X',
		},
	} as const;

	const amX = $derived(match?.X === user?.id);
	const xTurn = $derived(Boolean(match && match.turn % 2));
	const myTurn = $derived(amX === xTurn);

	$effect(() => {
		if (match) {
			pending = false;
			console.log(match);
		}
	});

	function handlePiecePlacement(i: number) {
		if (!match) return;
		pending = true;
		api.placePiece({
			match: match.id,
			square: i,
		});
	}
</script>

<div class={styles.TtfBoard}>
	<div style="transition: .5s; opacity: {overlay ? 0.25 : 1}">
		<img
			alt="octothorp line"
			src={lines.h.path}
			style="display: block; position: absolute; width: 100%; transform: translateY(-50%); top: 33.33%"
		/>
		<img
			alt="octothorp line"
			src={lines.h.path}
			style="display: block; position: absolute; width: 100%; transform: translateY(-50%); top: 66.66%"
		/>
		<img
			alt="octothorp line"
			src={lines.v.path}
			style="display: block; position: absolute; height: 100%; transform: translateX(-50%); left: 33.33%; transform-origin: top left"
		/>
		<img
			alt="octothorp line"
			src={lines.v.path}
			style="display: block; position: absolute; height: 100%; transform: translateX(-50%); left: 66.66%; transform-origin: top left"
		/>

		{#if match && !pending && myTurn && !overlay}
			<BoardButtons {match} onClick={handlePiecePlacement} />
		{/if}

		{#if match}
			<Pieces {match} />
			<Wave turn={match.turn} />
		{/if}
	</div>

	{#if overlay}
		<div
			style="align-items: center; height: 100%; padding: 0; justify-content: center; display: flex;"
		>
			<Center>
				<div
					style="width: 95%; height: 95%; vertical-align: middle; padding: 2.5%; border-radius: 2.5%;
                 overflow: hidden; overflow-y: auto; backdrop-filter: blur(20px); background: #000000cc;
                 box-shadow: 0 0 20px 0 black; flex-direction: column; gap: 5%;"
				>
					<Divisio layout="v" size="l">
						{overlay}
					</Divisio>
				</div>
			</Center>
		</div>
	{/if}
</div>
