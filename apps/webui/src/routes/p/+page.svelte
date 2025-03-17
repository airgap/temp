<script lang="ts">
	import { api } from 'monolith-ts-api';
	import type { GameStatus } from '@lyku/json-models';
	import { Thumbnail, phrasebook, sortGamesByPrecedence } from '@lyku/si-bits';
	import styles from './ViewGames.module.sass';
	import classNames from 'classnames';

	// CSS classes for various game statuses
	const statusClasses = {
		planned: styles.planned,
		wip: styles.wip,
		ea: styles.ea,
		ga: styles.ga,
		maintenance: styles.maintenance,
	} satisfies Record<GameStatus, string>;

	let gamesPromise = api.listGames({}).then(sortGamesByPrecedence);
</script>

<div style="text-align: center">
	{#await gamesPromise}
		<p>Loading...</p>
	{:then games}
		{#each games as { id, homepage, title, status, thumbnail }}
			<a
				class={classNames(styles.game, statusClasses[status])}
				{id}
				style="display: inline-block; margin: 10px"
				href={homepage}
			>
				<Thumbnail alt={title} src={thumbnail} />
				<label for={id.toString()}>
					{title}
					{#if status !== 'ga'}
						<div>[ {phrasebook[status]} ]</div>
					{/if}
				</label>
			</a>
		{/each}
	{:catch error}
		{String(error)}
	{/await}
</div>
