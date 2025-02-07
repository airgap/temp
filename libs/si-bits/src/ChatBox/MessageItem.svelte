<script lang="ts">
  import styles from './MessageItem.module.sass';
  import type { Message } from '@lyku/json-models';
  import { getContext } from 'svelte';

  export let src: Message;
  
  // Replace useCacheSingleton with getContext
  const cache = getContext('cache');
  $: user = $cache.users?.[src.author] ?? null;
</script>

<li class={styles.MessageItem}>
  <b>{user?.username ?? '-'}:&nbsp;</b>
  {src.content}
</li> 