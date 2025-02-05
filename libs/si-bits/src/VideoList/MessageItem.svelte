<script lang="ts">
  import { useCacheSingleton } from 'ui-bits';
  import styles from './MessageItem.module.sass';
  import type { Message } from '@lyku/json-models';

  export let src: Message;

  const [author] = useCacheSingleton('users', src.author);
</script>

<li class={styles.MessageItem}>
  <b>{author?.username}:&nbsp;</b>
  {src.content}
</li> 