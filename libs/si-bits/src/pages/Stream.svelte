<script lang="ts">
  import { ChatBox } from '../ChatBox';
  import { VideoList } from '../VideoList';
  import { Fof } from '../Fof';
  import { Tv } from '../Tv';
  import { TvBox } from '../TvBox';
  import { api } from 'monolith-ts-api';
  import type { Channel } from 'monolith-ts-api';

  let channelName = window.location.pathname.substring(1);
  let channelPromise = api.getChannel({ name: channelName });
</script>

{#await channelPromise}
  <p>Loading...</p>
{:then channel}
  <TvBox>
    <Tv {channel}>
      <Fof>{channel?.name ?? 'LYKU'}</Fof>
    </Tv>
  </TvBox>
  
  <ChatBox {channel} />
  <br />
  
  {#if channel}
    <VideoList {channel} />
  {/if}
{:catch error}
  <p>Error loading channel: {error.message}</p>
{/await} 