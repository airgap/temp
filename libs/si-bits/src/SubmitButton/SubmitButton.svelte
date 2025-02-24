<script lang="ts">
  import styles from './SubmitButton.module.sass';

  const props = $props<{ className?: string; disabled: boolean } & any>();
  const { className, disabled, ...rest } = props;
</script>

<button 
  class={styles.SubmitButton}
  class:className
  {disabled}
  on:click
  {...rest}
>
  {children}
</button> 