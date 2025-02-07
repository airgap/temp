<script lang="ts">
  import { Button } from '../Button';
  import { Crosshatch } from '../Crosshatch';
  import styles from './Close.module.sass';

  export let disabled: boolean = false;
  export let className: string = '';

  // In Svelte, we use the on:click directive instead of onClick prop
</script>

<Button
  {disabled}
  class={`${styles.Close} ${className}`}
  on:click
>
  <Crosshatch width="20px" bright={true} />
</Button> 