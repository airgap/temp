<script lang="ts">
  import styles from './Codette.module.sass';
  import classnames from 'classnames';

  const { dense = false, children } = $props<{
    dense?: boolean;
  }>();
</script>

<span class={classnames(styles.Codette, { [styles.dense]: dense })}>
  {@render children?.()}
</span>
