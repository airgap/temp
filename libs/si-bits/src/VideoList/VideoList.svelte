<script lang="ts">
  import { api } from 'monolith-ts-api';
  import { phrasebook } from '../phrasebook';
  import styles from './VideoList.module.sass';
  import type { Channel } from '@lyku/json-models';

  export let channel: Channel;

  async function loadVideos() {
    try {
      return await api.listChannelVideos({ channelId: channel.id });
    } catch (error) {
      throw new Error(String(error));
    }
  }

  let videosPromise = loadVideos();
  
  // Reactive statement to reload videos when channel.id changes
  $: {
    if (channel.id) {
      videosPromise = loadVideos();
    }
  }
</script>

<div>
  <h2>Shelf</h2>
  {#await videosPromise}
    <p>Loading...</p>
  {:catch error}
    <h1>{error}</h1>
  {:then videos}
    <ul class={styles.VideoList}>
      {#each videos as video (video.uid)}
        <li>
          <img src={video.thumbnail} alt={phrasebook.videoThumbnail} />
        </li>
      {/each}
    </ul>
  {/await}
</div> 