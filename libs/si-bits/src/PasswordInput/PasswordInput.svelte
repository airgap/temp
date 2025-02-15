<script lang="ts">
  import { password } from '@lyku/json-models';
  import { Texticle, type TexticleProps } from '../Texticle';
  import { phrasebook } from '../phrasebook';

  export const props = $props<TexticleProps>();
</script>

<Texticle
  type="password"
  schema={password}
  empty={phrasebook.passwordFieldEmpty}
  invalid={phrasebook.passwordFieldInvalid}
  valid={phrasebook.passwordFieldValid}
  {...props}
/> 