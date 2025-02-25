<script lang="ts">
  import styles from './SubmitButton.module.sass';

  const props = $props<{ className?: string; disabled: boolean; children: [] } & any>();
  const { className, disabled, children, ...rest } = props;
</script>

<button 
  class={styles.SubmitButton}
  class:className
  {disabled}
  on:click
  {...rest}
>
  {@render children?.()}
</button> 