<script lang="ts">
  import { api, setCookie } from 'monolith-ts-api';
  import { Agreeable } from '../Agreeable';
  import { EmailInput } from '../EmailInput';
  import { PasswordInput } from '../PasswordInput';
  import { ShowTos } from '../ShowTos';
  import { shout } from '../Sonic';
  import { SubmitButton } from '../SubmitButton';
  import { UsernameInput } from '../UsernameInput';
  import { phrasebook } from '../phrasebook';
  import { createEventDispatcher } from 'svelte';
  import { AuthOverlay } from '../AuthOverlay';
  const dispatch = createEventDispatcher();
  let {email, username, password, emailValid, usernameValid, passwordValid, agreed, error} = $state({
    email: '',
    username: '',
    password: '',
    emailValid: false,
    usernameValid: false,
    passwordValid: false,
    agreed: false,
    error: undefined
  });
  let valid = $derived( emailValid && usernameValid && passwordValid && agreed);
  
  const { visible } = $props<{ visible?: boolean }>();
  $effect(() => {
    console.log('email', email);
    console.log('username', username);
    console.log('password', password);
    console.log('emailValid', emailValid);
    console.log('usernameValid', usernameValid);
    console.log('passwordValid', passwordValid);
    console.log('agreed', agreed);
  });
  function handleSubmit() {
    dispatch('submit');
    api.registerUser({
      email,
      username,
      password,
      agreed: agreed as true,
    })
    .then((sessionId) => {
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
<AuthOverlay {visible}>
<h2>{phrasebook.regFormTitle}</h2>

<EmailInput 
  on:input={(e) => email = e.detail}
  on:validation={(e) => emailValid = e.detail}
/>

<UsernameInput
  on:input={(e) => username = e.detail}
  on:validation={(e) => usernameValid = e.detail}
/>

<PasswordInput
  on:input={(e) => password = e.detail}
  on:validation={(e) => {passwordValid = e.detail; console.log(passwordValid)}}
/>

<Agreeable on:input={(e) => {
  agreed = e.detail;
  console.log('agreed', agreed);
}}>
  {phrasebook.termsLabel} <ShowTos>{phrasebook.termsLink}</ShowTos>
</Agreeable>

<SubmitButton
  disabled={!valid}
  onclick={handleSubmit}
>
  {phrasebook.regFormTitle}
</SubmitButton>

{#if error}
  <h3>{error}</h3>
{/if} </AuthOverlay>