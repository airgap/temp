<script lang="ts">
  import { username } from '@lyku/json-models';
  import {Texticle} from '../Texticle';
  import { phrasebook } from '../phrasebook';

  const props = $props();
</script>

<Texticle
  schema={username}
  empty={phrasebook.usernameFieldEmpty}
  invalid={phrasebook.usernameFieldInvalid}
  valid={phrasebook.usernameFieldValid}
  {...props}
/> 