<script lang="ts">
  import styles from './Lingo.module.sass';
  import { language } from '../phrasebook';
  import { setCookie } from 'monolith-ts-api';
  import { Link } from '../Link';
  import Svg from '../assets/lingo.svelte';
  import type { Lang } from '@lyku/phrasebooks';
	import Button from '../Button/Button.svelte';

  const langs: Partial<Record<Lang, string>> = {
    'en-US': 'English',
    'ru-RU': 'Русский',
    'de-DE': 'Deutsch',
    'fr-FR': 'Français',
    'en-AR': 'Pirate',
    'wa-GH': 'Ork',
  } as const;

  const languages = Object.entries(langs).map(([code, name]) => ({
    code,
    name,
  })) as { code: Lang; name: string }[];

  let selectedLanguage: Lang = language in langs ? (language as Lang) : 'en-US';
  let isOpen = false;

  function handleLanguageChange(language: Lang) {
    selectedLanguage = language;
    isOpen = false;
    setCookie('lang', language, 365);
    window.location.reload();
  }
</script>

<div class={styles.languageSelector}>
  <Link 
    className={styles.languageSelectorButton} 
    on:click={() => isOpen = !isOpen}
  >
    <Svg />
  </Link>
  
  {#if isOpen}
    <ul class={styles.languageOptions}>
      {#each languages as language (language.code)}
        <li><Button
          onclick={() => handleLanguageChange(language.code)}
          class={selectedLanguage === language.code?styles.selected:''}
        >
          {language.name}
        </Button>
        </li>
      {/each}
    </ul>
  {/if}
</div> 