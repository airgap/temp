<script lang="ts">
  import styles from './SubmitButton.module.sass';

  export let className: string | undefined = undefined;
  
  export let disabled = false;
</script>

<button 
  class={styles.SubmitButton}
  class:className
  {disabled}
  {...$$restProps}
  on:click
>
  <slot />
</button> 