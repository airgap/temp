<script lang="ts">
  import classnames from 'classnames';
  import styles from './Static.module.sass';

  export let width: number | undefined = undefined;
  export let height: number | undefined = undefined;
  export let hidden: boolean | undefined = undefined;
</script>

<div
  style="width: {width}px; height: {height}px"
  class={classnames(styles.Static, {
    [styles.hidden]: hidden,
  })}
/> 