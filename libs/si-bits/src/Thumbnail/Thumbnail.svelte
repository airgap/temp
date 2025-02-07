<script lang="ts">
  import { Image, type ImageProps } from './Image.svelte';
  import styles from './Thumbnail.module.sass';

  export let {...props}: ImageProps;
</script>

<span class={styles.Thumbnail}>
  <Image {...props} />
</span> 