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

  let email = '';
  let username = '';
  let password = '';
  let emailValid = false;
  let usernameValid = false;
  let passwordValid = false;
  let agreed = false;
  let error: any = undefined;

  function handleSubmit() {
    shout('submitClicked', {});
    api.registerUser({
      email,
      username,
      password,
      agreed: agreed as true,
    })
    .then((sessionId) => {
      setCookie('sessionId', sessionId, 365);
      window.location.reload();
    })
    .catch((e) => error = e);
  }
</script>

<h2>{phrasebook.regFormTitle}</h2>

<EmailInput 
  oninput={(e) => email = e.detail}
  onvalidation={(e) => emailValid = e.detail}
/>

<UsernameInput
  oninput={(e) => username = e.detail}
  onvalidation={(e) => usernameValid = e.detail}
/>

<PasswordInput
  oninput={(e) => password = e.detail}
  onvalidation={(e) => passwordValid = e.detail}
/>

<Agreeable onchange={(e) => agreed = e.detail}>
  {phrasebook.termsLabel} <ShowTos>{phrasebook.termsLink}</ShowTos>
</Agreeable>

<SubmitButton
  disabled={!(emailValid && usernameValid && passwordValid && agreed)}
  onclick={handleSubmit}
>
  Register
</SubmitButton>

{#if error}
  <h3>{error}</h3>
{/if} 