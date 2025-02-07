<script lang="ts">
    import { jsonPrimitives } from 'from-schema';
    import { Texticle } from './Texticle.svelte';
    import { phrasebook } from './phrasebook';

    const { email } = jsonPrimitives;

    export let value = '';
    export let disabled = false;
    export let autofocus = false;
</script>

<Texticle
    type="email"
    schema={email}
    empty={phrasebook.emailFieldEmpty}
    invalid={phrasebook.emailFieldInvalid}
    valid={phrasebook.emailFieldValid}
    {value}
    {disabled}
    {autofocus}
    on:input
    on:validation
/> 