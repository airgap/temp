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
  import { Dialog } from '../Dialog';
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
  const valid = $derived( emailValid && usernameValid && passwordValid && agreed);
  
  const { visible, onsubmit, onsuccess, onerror, ondismiss } = $props<{ visible?: boolean, onsubmit: () => void, onsuccess: () => void, onerror: () => void, ondismiss: () => void }>();
  $effect(() => {
    console.log('email', email);
    console.log('username', username);
    console.log('password', password);
    console.log('emailValid', emailValid);
    console.log('usernameValid', usernameValid);
    console.log('passwordValid', passwordValid);
    console.log('agreed', agreed);
  });
  $effect(() => {console.log('valid', valid)});
  function handleSubmit() {
    onsubmit?.();
    api.registerUser({
      email,
      username,
      password,
      agreed: agreed as true,
    })
    .then((sessionId) => {
      // setCookie('sessionId', sessionId, 365);
      onsuccess?.();
      // alert('success');
      window.location.reload();
    })
    .catch((e) => {
      onerror?.();
      error = e;
    });
  }
</script>
<Dialog {visible} {ondismiss}>
<h2>{phrasebook.regFormTitle}</h2>

<EmailInput 
  oninput={(e) => email = e.target.value}
  onvalidation={(e) => emailValid = e}
/>

<UsernameInput
  oninput={(e) => username = e.target.value}
  onvalidation={(e) => usernameValid = e}
/>

<PasswordInput
  oninput={(e) => password = e.target.value}
  onvalidation={(e) => {passwordValid = e; console.log(passwordValid)}}
/>

<Agreeable oninput={(e) => {
  agreed = e.target.checked;
  console.log('agreed', agreed);
}}>
  
</Agreeable>

<SubmitButton
  disabled={!valid}
  onclick={handleSubmit}
>
  {phrasebook.regFormTitle}
</SubmitButton>

{#if error}
  <h3>{error}</h3>
{/if} </Dialog>