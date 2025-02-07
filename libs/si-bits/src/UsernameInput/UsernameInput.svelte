<script lang="ts">
  import { username } from '@lyku/json-models';
  import Texticle from './Texticle.svelte';
  import { phrasebook } from './phrasebook';

  export let props = {};
</script>

<Texticle
  schema={username}
  empty={phrasebook.usernameFieldEmpty}
  invalid={phrasebook.usernameFieldInvalid}
  valid={phrasebook.usernameFieldValid}
  {...props}
/> 