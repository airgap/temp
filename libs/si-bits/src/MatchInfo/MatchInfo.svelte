<script lang="ts">
	import styles from './MatchInfo.module.sass';
	import { api } from 'monolith-ts-api';
	import type { TtfMatch, User } from '@lyku/json-models';
	import { localizeUsername } from '../localizeUsername';

	const { match } = $props<{ match: TtfMatch | undefined }>();

	let xUser = $state<User>();
	let oUser = $state<User>();
	let tried = false;

	const xTurn = $derived(match?.turn && match.turn % 2);
	const oTurn = $derived(match?.turn && match.turn % 2 === 0);

	$effect(() => {
		if (match && !tried) {
			tried = true;
			api
				.getUsers([match.X, match.O])
				.then(([x, o]) => {
					xUser = x;
					oUser = o;
				})
				.catch(console.error);
		}
	});
</script>

<div class={styles.MatchInfo}>
	<div class={`${styles.x} ${xTurn ? styles.myTurn : ''}`}>
		{localizeUsername(xUser?.username)}
	</div>
	<div class={styles.vs}>vs</div>
	<div class={`${styles.o} ${oTurn ? styles.myTurn : ''}`}>
		{localizeUsername(oUser?.username)}
	</div>
</div>
