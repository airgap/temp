<script lang="ts">
  import { username } from '@lyku/json-models';
  import {Texticle} from '../Texticle';
  import { phrasebook } from '../phrasebook';

  export let props = {};
</script>

<Texticle
  schema={username}
  empty={phrasebook.usernameFieldEmpty}
  invalid={phrasebook.usernameFieldInvalid}
  valid={phrasebook.usernameFieldValid}
  on:validation
  on:input
  {...props}
/> 