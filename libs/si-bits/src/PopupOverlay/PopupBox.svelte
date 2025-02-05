<script lang="ts">
  import styles from './PopupBox.module.sass';

  export let overlay: string;
  export let buttonContent: any = undefined;

  function dismiss() {
    window.dispatchEvent(new Event(`hide${overlay}`));
  }
</script>

<div class={styles.WinBox}>
  <button aria-label="Close" class={styles.close} on:click={dismiss}></button>
  <slot />
  {#if buttonContent}
    <button aria-label="Dismiss" class={styles.action} on:click={dismiss}>
      {buttonContent}
    </button>
  {/if}
</div> 