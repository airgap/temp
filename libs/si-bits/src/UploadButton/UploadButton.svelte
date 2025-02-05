<script lang="ts">
  import { imageAndVideoMimes } from '@lyku/defaults';
  import { phrasebook } from '../phrasebook';
  import upload from '../assets/plus.svg';
  import styles from './UploadButton.module.sass';

  const id = Math.random().toString();
</script>

<input
  type="file"
  class={styles.file}
  {id}
  name="avatar"
  accept={imageAndVideoMimes}
  multiple={true}
  on:change
/>
<label for={id}>
  <img
    src={upload}
    class={styles.UploadButton}
    alt={phrasebook.upload}
  />
</label> 