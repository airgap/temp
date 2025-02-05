<script lang="ts">
  import type { StringJsonSchema } from 'from-schema';
  import styles from './Texticle.module.sass';
  
  type Type = 'text' | 'email' | 'password';
  
  export let schema: StringJsonSchema | undefined = undefined;
  export let empty: string = '';
  export let valid: string | undefined = undefined;
  export let invalid: string | undefined = undefined;
  export let onInput: ((text: string) => void) | undefined = undefined;
  export let onValidation: ((valid: boolean) => void | boolean) | undefined = undefined;
  export let pattern: string | undefined = undefined;
  export let type: Type = 'text';
  export let minLength: number | undefined = undefined;
  export let maxLength: number | undefined = undefined;
  export let multiline: boolean = false;
  export let value: string = '';

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
    onInput?.(value);
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
    onValidation?.(isValid);
  }

  $: value, empty, updatePlaceholder();
</script>

<div class={styles.Texticle} class:valid={isValid} class:invalid={isInvalid}>
  {#if multiline}
    <textarea
      {id}
      on:input={handleInput}
      placeholder="-"
      bind:value
    ></textarea>
  {:else}
    <input
      {id}
      on:input={handleInput}
      placeholder="-"
      {type}
      bind:value
    />
  {/if}
  <label for={id}>{label}</label>
</div> 