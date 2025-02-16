<script lang="ts">
  import { api, setCookie } from 'monolith-ts-api';
  import { EmailInput } from '../EmailInput';
  import { PasswordInput } from '../PasswordInput';
  import { shout } from '../Sonic';
  import { SubmitButton } from '../SubmitButton';
  import { phrasebook } from '../phrasebook';
  import { AuthOverlay } from '../AuthOverlay';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let email = '';
  let password = '';
  let emailValid = false;
  let passwordValid = false;
  export let visible = false;

  function handleSubmit() {
    dispatch('submit');
    api.loginUser({
      email,
      password,
    })
    .then(({ sessionId }) => {
      setCookie('sessionId', sessionId, 365);
      dispatch('success');
      window.location.reload();
    })
    .catch((e) => {
      dispatch('error', e);
      error = e;
    });
  }
</script>
<AuthOverlay visible={visible}>
<h2>{phrasebook.loginFormTitle}</h2>
<EmailInput 
  oninput={(e) => email = e.detail} 
  on:validation={(e) => emailValid = e} 
/>
<PasswordInput 
  oninput={(e) => password = e.detail} 
  on:validation={(e) => passwordValid = e} 
/>
<SubmitButton
  disabled={!(emailValid && passwordValid)}
  onclick={handleSubmit}
>
  {@html phrasebook.loginFormSubmit}
</SubmitButton> </AuthOverlay>