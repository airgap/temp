<script lang="ts">
	import styles from './MessageItem.module.sass';
	import type { Message } from '@lyku/json-models';
	import { getContext } from 'svelte';

	const { src } = $props<{
		src: Message;
	}>();

	// Replace useCacheSingleton with getContext
	const cache = getContext('cache');
	const user = $derived(cache.users?.[src.author] ?? null);
</script>

<li class={styles.MessageItem}>
	<b>{user?.username ?? '-'}:&nbsp;</b>
	{src.content}
</li>
