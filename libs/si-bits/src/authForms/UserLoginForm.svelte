<script lang="ts">
  import { api, setCookie } from 'monolith-ts-api';
  import { EmailInput } from '../EmailInput';
  import { PasswordInput } from '../PasswordInput';
  import { shout } from '../Sonic';
  import { SubmitButton } from '../SubmitButton';
  import { phrasebook } from '../phrasebook';

  let email = '';
  let password = '';
  let emailValid = false;
  let passwordValid = false;

  function handleSubmit() {
    shout('submitClicked', {});
    api.loginUser({
      email,
      password,
    })
    .then(({ sessionId }) => {
      setCookie('sessionId', sessionId, 365);
      window.location.reload();
    })
    .catch(alert);
  }
</script>

<h2>{phrasebook.loginFormTitle}</h2>
<EmailInput 
  oninput={(e) => email = e.detail} 
  onvalidation={(e) => emailValid = e.detail} 
/>
<PasswordInput 
  oninput={(e) => password = e.detail} 
  onvalidation={(e) => passwordValid = e.detail} 
/>
<SubmitButton
  disabled={!(emailValid && passwordValid)}
  onclick={handleSubmit}
>
  {@html phrasebook.loginFormSubmit}
</SubmitButton> 