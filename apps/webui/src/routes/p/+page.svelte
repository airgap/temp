<script lang="ts">
	import type { GameStatus, User } from '@lyku/json-models';
	import {
		phrasebook,
		sortGamesByPrecedence,
		Thumbnail,
		userStore,
	} from '@lyku/si-bits';
	import styles from './ViewGames.module.sass';
	import classNames from 'classnames';

	const { data } = $props<{
		data:
			| {
					users: Promise<User[]>;
					user: User;
			  }
			| { error: string };
	}>();
	const { games, users, user, publishers, developers } = data;
	userStore.set(user);
	// CSS classes for various game statuses
	const statusClasses = {
		planned: styles.planned,
		wip: styles.wip,
		ea: styles.ea,
		ga: styles.ga,
		maintenance: styles.maintenance,
	} satisfies Record<GameStatus, string>;
	$effect(()=>{
		console.log('games', games, 'developers', developers, 'publishers', publishers)
	})
</script>

<div style="text-align: center">
	{#each games ?? [] as { id, homepage, title, status, thumbnail }}
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
</div>
