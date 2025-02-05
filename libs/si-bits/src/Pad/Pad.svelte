<script lang="ts">
  import { sizes, type Size } from '../sizes';
  
  export let size: Size;
</script>

<div style="margin: {sizes[size]}">
  <slot />
</div> 