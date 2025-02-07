<script lang="ts">
  import classnames from 'classnames';
  import styles from './Crosshatch.module.sass';

  export let width: string | undefined = undefined;
  export let height: string | undefined = undefined;
  export let style: Record<string, string> = {};
  export let bright: boolean = false;
</script>

<div
  class={classnames(styles.Crosshatch, { [styles.bright]: bright })}
  style:width={width}
  style:height={height}
  {...style}
></div> 