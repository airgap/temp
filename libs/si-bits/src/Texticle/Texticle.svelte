<script lang="ts">
  import type { StringJsonSchema } from 'from-schema';
  import styles from './Texticle.module.sass';
  import classNames from 'classnames';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  type Type = 'text' | 'email' | 'password';
  
  let { schema, empty, valid, invalid, pattern, type, minLength, maxLength, multiline, value } = $props<{ schema?: StringJsonSchema; empty?: string; valid?: string; invalid?: string; pattern?: string; type?: Type; minLength?: number; maxLength?: number; multiline?: boolean; value?: string }>();

  let label = empty;
  let isValid = false;
  let isInvalid = false;
  const id = Math.random().toString().substring(2);

  function validate(text: string): boolean {
    const patternToUse = pattern ?? schema?.pattern;
    if (patternToUse && !RegExp(patternToUse).test(text)) return false;
    const minlen = minLength ?? schema?.minLength;
    if (minlen && text.length < minlen) return false;
    const maxlen = maxLength ?? schema?.maxLength;
    if (maxlen && text.length > maxlen) return false;
    return true;
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    value = target.value;
    dispatch('input', value);
    updatePlaceholder();
  }

  function updatePlaceholder() {
    isValid = validate(value);
    isInvalid = !isValid;
    label = value
      ? isValid
        ? valid ?? empty
        : invalid ?? empty
      : empty;
    label = label ?? empty ?? ' ';
    dispatch('validation', isValid);
  }

  $effect(updatePlaceholder);
</script>

<div class={styles.Texticle} class:valid={isValid} class:invalid={isInvalid}>
  {#if multiline}
    <textarea
      {id}
      oninput={handleInput}
      placeholder=""
      bind:value
    ></textarea>
  {:else}
    <input
      {id}
      oninput={handleInput}
      placeholder=""
      {type}
      bind:value
    />
  {/if}
  <label for={id}>{label}</label>
</div> 