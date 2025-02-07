<script lang="ts">
  import { Image } from '../Image';
  import styles from '../Image/Image.module.sass';
  import smile from '../smile.png';
  
  export let url = smile;
  export let alt: string | undefined = undefined;
  export let size: number | undefined = undefined;
</script>

<span class={styles.ProfilePicture}>
  <Image shape="squircle" {url} {alt} {size} />
</span> 