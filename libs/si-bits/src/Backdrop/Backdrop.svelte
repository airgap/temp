<script lang="ts">
  import { formImageUrl } from '../formImageUrl';
  import styles from './Backdrop.module.sass';
  import drop from './drop.png';

  let { image } = $props<{
    image?: string;
  }>();
</script>

<div class={styles.Backdrop} style={`background-image: url('${image ? formImageUrl(image) : drop}')`}>
</div> 