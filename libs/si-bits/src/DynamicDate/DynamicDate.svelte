<script lang="ts">
  import { prettyTime } from '@lyku/helpers';
  import styles from './DynamicDate.module.sass';

  export let time: Date;
</script>

<span class={styles.DynamicDate}>{prettyTime(time)}</span> 