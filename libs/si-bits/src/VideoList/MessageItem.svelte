<script lang="ts">
	import { cacheStore } from '../CacheProvider';
	import styles from './MessageItem.module.sass';
	import type { Message } from '@lyku/json-models';

	const { src } = $props<{ src: Message }>();

	const [author] = cacheStore.users.fetch(src.author);
</script>

<li class={styles.MessageItem}>
	<b>{author?.username}:&nbsp;</b>
	{src.content}
</li>
