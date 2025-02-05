<script lang="ts">
  import classnames from 'classnames';
  import styles from './TvFrame.module.sass';

  export let size: 'auto' | undefined = undefined;
  export let height: number | undefined = undefined;
</script>

<div
  class={classnames(styles.TvFrame, {
    [styles.auto]: size === 'auto',
  })}
  style={`height: ${height}px`}
>
  <slot />
</div> 