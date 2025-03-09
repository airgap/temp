<script lang="ts">
  import { Stream } from '@cloudflare/stream-react';
  import classnames from 'classnames';
  import type { Channel } from '@lyku/json-models';
  import { Aerial } from '../Aerial';
  import { Screensaver } from '../Screensaver';
  import { Static } from '../Static';
  import { TvFrame } from '../TvFrame';
  import styles from './Tv.module.sass';
	import type { ComponentType } from 'svelte';

  const { channel, showStatic, children } = $props<{ channel: Channel | undefined; showStatic: boolean, children?: ComponentType }>();

  let frameRef: HTMLDivElement = $state();
  let ready = $state(false);
  let height = $state(480);
  let loading = $state(false);

  function hideStream() {
    console.log('Done streaming!');
    height = 480;
    ready = false;
    loading = false;
    if (frameRef) {
      frameRef.style.height = '480px';
    }
  }

  function nowReady(e: Event) {
    showStream(e);
  }

  function showStream(e: Event) {
    console.log('Now streaming!');
    const streamHeight = document.getElementsByClassName(styles.Stream)[0]
      .clientHeight;
    if (frameRef) {
      frameRef.style.height = `${streamHeight}px`;
    }
    height = streamHeight;
    ready = true;
  }

  function loadStart() {
    loading = true;
  }
</script>

<div class={styles.Tv}>
  <Aerial {loading} />
  <TvFrame {height}>
    <Screensaver {channel} {ready}>
      {@render children?.()}
    </Screensaver>
    {#if channel?.whepKey}
      <div
        class={classnames(styles.StreamBox, {
          [styles.inactive]: !ready,
        })}
      >
        <Stream
          class={styles.Stream}
          src={channel.whepKey}
          onerror={hideStream}
          onended={hideStream}
          onloadstart={loadStart}
          oncanplay={nowReady}
          controls
          autoplay={true}
        />
      </div>
    {/if}
    <Static hidden={!showStatic} />
  </TvFrame>
</div> 