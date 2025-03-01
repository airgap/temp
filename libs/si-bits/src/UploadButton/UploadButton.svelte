<script lang="ts">
  import { imageAndVideoMimes } from '@lyku/defaults';
  import { phrasebook } from '../phrasebook';
  import upload from '../assets/plus.svg?raw';
  import styles from './UploadButton.module.sass';

  const id = Math.random().toString();
  const props = $props();
</script>

<input
  type="file"
  class={styles.file}
  {id}
  name="avatar"
  accept={imageAndVideoMimes}
  multiple={true}
  {...props}
  alt={phrasebook.upload}
/>
<label for={id} class={styles.UploadButton}>
	{@html upload}
</label>
