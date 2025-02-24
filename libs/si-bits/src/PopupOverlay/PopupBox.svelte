<script lang="ts">
  import styles from './PopupBox.module.sass';

  const { overlay, buttonContent } = $props<{ overlay: string; buttonContent: any }>();

  function dismiss() {
    window.dispatchEvent(new Event(`hide${overlay}`));
  }
</script>

<div class={styles.WinBox}>
  <button aria-label="Close" class={styles.close} onclick={dismiss}></button>
  {children}
  {#if buttonContent}
    <button aria-label="Dismiss" class={styles.action} onclick={dismiss}>
      {buttonContent}
    </button>
  {/if}
</div> 