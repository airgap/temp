<script lang="ts">
  import styles from './Button.module.sass';
  
  let { 
    disabled = false,
    className = '',
    type = 'button' as 'button' | 'submit' | 'reset',
    style = {} as Record<string, string>
  } = $props();
</script>

<button
  {disabled}
  class={`${styles.Button} ${className}`}
  {type}
  {style}
  on:click
>
  {@render children?.()}
</button> 