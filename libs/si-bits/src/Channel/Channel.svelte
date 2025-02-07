<script lang="ts">
  import styles from './Channel.module.sass';

  export let channel: number;
  export let selected: boolean;
</script>

<a
  href="#{channel}"
  class={`${styles.Channel} ${selected ? styles.selected : ''}`}
>
  {channel}
</a> 