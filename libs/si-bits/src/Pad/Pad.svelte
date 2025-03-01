<script lang="ts">
  import { sizes, type Size } from '../sizes';
  
  const { size, children } = $props<{ size: Size, children?: any[] }>();
</script>

<div style="margin: {sizes[size]}">
  {children?.()}
</div> 