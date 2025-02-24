<script lang="ts">
  import { Image } from '../Image';
  import styles from '../Image/Image.module.sass';
  import smile from '../smile.png';
  
  const { url, alt, size } = $props<{ url: string; alt?: string; size?: number }>();
</script>

<span class={styles.ProfilePicture}>
  <Image shape="squircle" {url} {alt} {size} />
</span> 