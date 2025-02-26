<script lang="ts">
  import { onMount } from 'svelte';
  import classnames from 'classnames';
  import LoadingOverlay from '../LoadingOverlay/LoadingOverlay.svelte';
  import type { ComponentType } from 'svelte';
  import hidden from '../hidden.module.sass';
  import styles from './Dialog.module.sass';

  const loading = $state(false);
  const { visible = false, children = [], ondismiss } = $props<{ visible: boolean, children: ComponentType, ondismiss: () => void }>();
  import { spring } from "svelte/motion";

  const fadeSpring = spring(1, { stiffness: 0.1, damping: 0.5 });
  const transformSpring = spring(0, { stiffness: 0.2, damping: 0.5 });

  $effect(() => {
    fadeSpring.update(val => (visible ? 1 : 0));
    transformSpring.update(val => (visible ? 100 : 0));
  });

  const toggleTransform = () => transformSpring.update(val => (val ? 0 : 100));
  const snapTransform = () => transformSpring.update(val => val, { hard: true });
</script>

<div 
  class={classnames(styles.Dialog)}
  style="opacity: {$fadeSpring}; pointer-events: {visible ? 'auto' : 'none'}"
  onclick={ondismiss}
  onkeydown={(e) => {
    if (e.key === 'Escape') {
      ondismiss();
    }
  }}
  role="dialog"
>
  <div 
    class={styles.AuthForm} 
    style="transform: scale({$transformSpring}%) rotate({($transformSpring / 5) - 20}deg)"
    onclick={(e) => e.stopPropagation()}
  >
    <div 
      class={classnames(styles.interactives, {
        [hidden.hidden]: loading
      })}
    >
      <button 
        class={styles.Close}
        onclick={ondismiss}
        aria-label="Close"
      ></button>
      {@render children?.()}
    </div>
    <LoadingOverlay visible={loading} />
  </div>
</div>