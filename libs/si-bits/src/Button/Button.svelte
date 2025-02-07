<script lang="ts">
  import styles from './Button.module.sass';
  
  export let disabled = false;
  export let className = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let style: Record<string, string> = {};
</script>

<button
  {disabled}
  class={`${styles.Button} ${className}`}
  {type}
  {style}
  on:click
>
  <slot />
</button> 