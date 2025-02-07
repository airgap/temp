<script lang="ts">
  import styles from './ChannelLogo.module.sass';
  import face from './face.png';

  export let url: string | undefined = undefined;
</script>

<span class={styles.ChannelLogo}>
  <img src={url || face} alt="Channel logo" />
</span> 