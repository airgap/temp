<script lang="ts">
  import classnames from 'classnames';
  import styles from './TvFrame.module.sass';

  const { size, height } = $props<{ size?: 'auto'; height?: number }>();
</script>

<div
  class={classnames(styles.TvFrame, {
    [styles.auto]: size === 'auto',
  })}
  style={`height: ${height}px`}
>
  {@render children?.()}
</div> 