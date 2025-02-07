<script lang="ts">
  import styles from './Codette.module.sass';
  import classnames from 'classnames';

  export let dense = false;
</script>

<span class={classnames(styles.Codette, { [styles.dense]: dense })}>
  <slot />
</span> 