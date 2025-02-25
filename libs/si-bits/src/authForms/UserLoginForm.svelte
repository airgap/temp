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
  
  // Props
  const { visible } = $props<{ visible: boolean }>();

  // Form state
  let email = $state('');
  let password = $state('');
  let emailValid = $state(false);
  let passwordValid = $state(false);
  let error = $state<Error | null>(null);

  // Computed form validity
  const isFormValid = $derived(emailValid && passwordValid);

  // Event handlers
  function handleEmailInput(e: CustomEvent<string>) {
    email = e.detail;
  }

  function handlePasswordInput(e: CustomEvent<string>) {
    password = e.detail;
  }

  function handleEmailValidation(e: CustomEvent<boolean>) {
    emailValid = e.detail;
  }

  function handlePasswordValidation(e: CustomEvent<boolean>) {
    passwordValid = e.detail;
  }

  async function handleSubmit() {
    try {
      dispatch('submit');
      error = null;

      const { sessionId } = await api.loginUser({ email, password });
      setCookie('sessionId', sessionId, 365);
      dispatch('success');
      window.location.reload();
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      dispatch('error', error);
    }
  }
</script>

<AuthOverlay {visible} on:dismiss>
  <h2>{phrasebook.loginFormTitle}</h2>
  
  <EmailInput 
    on:input={handleEmailInput}
    on:validation={handleEmailValidation}
  />

  <PasswordInput 
    on:input={handlePasswordInput}
    on:validation={handlePasswordValidation}
  />

  {#if error}
    <div class="error">
      {error.message}
    </div>
  {/if}

  <SubmitButton
    disabled={!isFormValid}
    on:click={handleSubmit}
  >
    {@html phrasebook.loginFormSubmit}
  </SubmitButton>
</AuthOverlay>

<style lang="sass">
  .error
    color: red
    margin: 1rem 0
</style>