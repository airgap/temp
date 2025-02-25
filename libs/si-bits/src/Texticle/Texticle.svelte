<script lang="ts">
  import type { StringJsonSchema } from 'from-schema';
  import styles from './Texticle.module.sass';
  import classNames from 'classnames';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  type Type = 'text' | 'email' | 'password';
  
  let { schema, empty, valid, invalid, pattern, type, minLength, maxLength, multiline, value } = $props<{ schema?: StringJsonSchema; empty?: string; valid?: string; invalid?: string; pattern?: string; type?: Type; minLength?: number; maxLength?: number; multiline?: boolean; value?: string }>();

  const id = Math.random().toString().substring(2);

  const formatRegexes = {
    'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
    time: /^\d{2}:\d{2}:\d{2}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    duration: /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'idn-email': /^[^@]+@[^@]+\.[^@]+$/,
    hostname: /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    'idn-hostname': /^[^.]+(?:\.[^.]+)*$/,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
    uri: /^[a-zA-Z][a-zA-Z0-9+.-]*:[^\s]*$/,
    'uri-reference': /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:)?(?:\/\/(?:(?:[a-zA-Z0-9\-._~!$&'()*+,;=:]|%[0-9A-F]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-F]{1,4}:){6}|::(?:[0-9A-F]{1,4}:){5}|(?:[0-9A-F]{1,4})?::(?:[0-9A-F]{1,4}:){4}|(?:(?:[0-9A-F]{1,4}:){0,1}[0-9A-F]{1,4})?::(?:[0-9A-F]{1,4}:){3}|(?:(?:[0-9A-F]{1,4}:){0,2}[0-9A-F]{1,4})?::(?:[0-9A-F]{1,4}:){2}|(?:(?:[0-9A-F]{1,4}:){0,3}[0-9A-F]{1,4})?::[0-9A-F]{1,4}:|(?:(?:[0-9A-F]{1,4}:){0,4}[0-9A-F]{1,4})?::)(?:[0-9A-F]{1,4}:[0-9A-F]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-F]{1,4}:){0,5}[0-9A-F]{1,4})?::[0-9A-F]{1,4}|(?:(?:[0-9A-F]{1,4}:){0,6}[0-9A-F]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[a-zA-Z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[a-zA-Z0-9\-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(?::[0-9]*)?(?:\/(?:[a-zA-Z0-9\-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*|\/(?:(?:[a-zA-Z0-9\-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:\/(?:[a-zA-Z0-9\-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)?|(?:[a-zA-Z0-9\-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:\/(?:[a-zA-Z0-9\-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)?(?:\?(?:[a-zA-Z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-F]{2})*)?(?:#(?:[a-zA-Z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-F]{2})*)?$/i,
    'uri-template': /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    'json-pointer': /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    'relative-json-pointer': /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    phone: /^\+?[1-9]\d{1,14}$/,
    regex: /^(?:(?:[^?*+{}()[\]\\|]+|\\.|\[(?:[^\]\\]|\\.)*\]|\((?:[^)\\]|\\.)*\)|\{[0-9]+(?:,[0-9]*)?}|[?*+]|\|)*)$/
  }
const finalPattern = $derived( pattern ?? schema?.pattern ?? ('format' in schema && schema.format in formatRegexes && formatRegexes[schema.format]));
$effect(()=>{
  console.log('finalPattern', finalPattern);
});
  function validate(text: string): boolean {
    if(typeof text !== 'string') return false;
    console.log('schema', schema);
    const patternToUse = finalPattern;
    console.log('patternToUse', patternToUse);
    if (patternToUse && !RegExp(patternToUse).test(text)) return false;
    const minlen = minLength ?? schema?.minLength;
    if (minlen && text.length < minlen) return false;
    const maxlen = maxLength ?? schema?.maxLength;
    if (maxlen && text.length > maxlen) return false;
    console.log('pass');
    return true;
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    dispatch('input', target.value);
  }
const isValid = $derived(validate(value));
const isInvalid = $derived(!isValid);
const label = $derived((value
      ? isValid
        ? valid ?? empty
        : invalid ?? empty
      : empty) ?? empty ?? ' ');
  $effect(()=>{
    dispatch('validation', isValid);
  });
</script>

<div class={classNames(styles.Texticle, {[styles.valid]:isValid,[styles.invalid]:isInvalid})}>
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