<script lang="ts">
    import { jsonPrimitives } from 'from-schema';
    import { Texticle } from '../Texticle';
    import { phrasebook } from '../phrasebook';

    const { email } = jsonPrimitives;

    const props = $props();
</script>

<Texticle
    schema={email}
    empty={phrasebook.emailFieldEmpty}
    invalid={phrasebook.emailFieldInvalid}
    valid={phrasebook.emailFieldValid}
    {...props}
/> 