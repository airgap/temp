<script lang="ts">
  import gsap from 'gsap';
  import { api } from 'monolith-ts-api';
  import { onMount, onDestroy } from 'svelte';
  import { Logo } from '../Logo';
  import { listen } from '../Sonic';
  import { phrasebook } from '../phrasebook';
  import styles from './Screensaver.module.sass';
  import tickPath from './tick.wav';
  import type { Bounce, Channel } from '@lyku/json-models';

  export let channel: Channel | undefined = undefined;
  let children: any = $$slots.default;

  const tick = new Audio(tickPath);
  tick.load();

  const flashColors = {
    edge: 'green',
    corner: 'blue',
    neither: 'red',
  };

  let showTut = true;
  const width = 640;
  const height = 480;
  let x = 0;
  let y = 0;
  let edges = 0;
  let corners = 0;
  let logo: HTMLImageElement;
  let flash: HTMLDivElement;
  let animationFrameId: number;

  const pointsAsText = (key: 'edge' | 'corner') => {
    const points = { edge: edges, corner: corners }[key];
    const plural = Number(points !== 1);
    const phrase = {
      edge: [phrasebook.bounceEdge, phrasebook.bounceEdges],
      corner: [phrasebook.bounceCorner, phrasebook.bounceCorners],
    }[key][plural];
    return `${points} ${phrase}`;
  };

  const calcX = (time: number) => pingPong(time, 7000);
  const calcY = (time: number) => pingPong(time, 5300);

  const animate = (time: number) => {
    const w = width - 147;
    const h = height - 100;
    const now = +new Date();
    x = calcX(now) * w;
    y = calcY(now) * h;
    animationFrameId = requestAnimationFrame(animate);
  };

  const calcPoints = (val: number) => Math.abs(val - 0.5) > 0.493;

  const score = (xVal: boolean, yVal: boolean) => {
    const corner = xVal && yVal;
    if (corner) corners++; else edges++;
    return api.bounced({
      edge: !corner,
      corner,
      channelId: channel?.id,
    });
  };

  const flashBox = (type: keyof typeof flashColors) => {
    gsap.fromTo(
      flash,
      {
        backgroundColor: flashColors[type],
      },
      {
        backgroundColor: 'transparent',
        duration: 1,
      }
    );
  };

  const click = () => {
    const now = Number(new Date());
    const xPoints = calcPoints(calcX(now));
    const yPoints = calcPoints(calcY(now));
    const hit = xPoints || yPoints;
    const bounceTypes: Bounce[] = ['neither', 'edge', 'corner'];
    const type = bounceTypes[Number(xPoints) + Number(yPoints)];
    flashBox(type);
    if (hit) {
      if (showTut) showTut = false;
      void score(xPoints, yPoints);
      void tick.play();
    } else {
      edges = 0;
      corners = 0;
    }
    console.log(xPoints, yPoints);
  };

  const pingPong = (time: number, int: number) => {
    const intervals = ~~(time / int);
    const up = intervals % 2;
    const rem = time / int - intervals;
    const y = up ? 1 - rem : rem;
    return y;
  };

  onMount(() => {
    listen('pulledScores', (e) => {
      edges = e.edges;
      corners = e.corners;
      showTut = false;
    });

    animationFrameId = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
</script>

<div class={styles.ScreenSaver} on:mousedown={click} tabindex="0" role="button" aria-label="Catch the edge">
  <div class={styles.SaverScorebox}>
    <div class={styles.SaverScoreText}>
      {#if showTut}
        {phrasebook.bounceTutorial}
      {:else}
        <div>{pointsAsText('corner')}</div>
        <div>{pointsAsText('edge')}</div>
      {/if}
    </div>
  </div>
  <Logo {x} {y} bind:logoRef={logo} bind:flashRef={flash}>
    <slot />
  </Logo>
</div> 