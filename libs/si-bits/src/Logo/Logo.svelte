<script lang="ts">
  import { formImageUrl } from '../formImageUrl';
  import { phrasebook } from '../phrasebook';
  import styles from './Logo.module.sass';
  import { createEventDispatcher } from 'svelte';

  export let x: number | undefined = undefined;
  export let y: number | undefined = undefined;
  export let id: string | undefined = undefined;

  const dispatch = createEventDispatcher();
  let logoElement: HTMLImageElement;
  let flashElement: HTMLDivElement;

  // Dispatch references when they're available
  $: if (logoElement) {
    dispatch('logoRef', logoElement);
  }
  $: if (flashElement) {
    dispatch('flashRef', flashElement);
  }
</script>

<div class={styles.Logo} style="left: {x}px; top: {y}px">
  {#if id}
    <img 
      src={formImageUrl(id)} 
      alt={phrasebook.bounceLogoAlt} 
      bind:this={logoElement} 
    />
  {:else}
    <slot />
  {/if}
  <div class={styles.flash} bind:this={flashElement}></div>
</div> 