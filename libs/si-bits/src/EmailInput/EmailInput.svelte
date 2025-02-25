<script lang="ts">
    import { jsonPrimitives } from 'from-schema';
    import { Texticle } from '../Texticle';
    import { phrasebook } from '../phrasebook';

    const { email } = jsonPrimitives;

    const { value, disabled, autofocus } = $props<{ value: string; disabled: boolean; autofocus: boolean }>();
</script>

<Texticle
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