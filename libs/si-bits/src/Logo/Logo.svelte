<script lang="ts">
  import { formImageUrl } from '../formImageUrl';
  import { phrasebook } from '../phrasebook';
  import styles from './Logo.module.sass';
  import { createEventDispatcher } from 'svelte';

  const { x, y, id } = $props<{ x?: number; y?: number; id?: string }>();

  const dispatch = createEventDispatcher();
  let logoElement: HTMLImageElement;
  let flashElement: HTMLDivElement;

  // Dispatch references when they're available
  $effect(() => {
    if (logoElement) {
      dispatch('logoRef', logoElement);
    }
  });
  $effect(() => {
    if (flashElement) {
      dispatch('flashRef', flashElement);
    }
  });
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