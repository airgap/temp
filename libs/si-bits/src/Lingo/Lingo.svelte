<script lang="ts">
  import styles from './Lingo.module.sass';
  import { language } from '../phrasebook';
  import { setCookie } from 'monolith-ts-api';
  import { Link } from '../Link';
  import lingo from '../assets/lingo.svg';
  import type { Lang } from '@lyku/phrasebooks';

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
    class={styles.languageSelectorButton} 
    on:click={() => isOpen = !isOpen}
  >
    <img src={lingo} class={styles.globe} alt="Language selector" />
  </Link>
  
  {#if isOpen}
    <ul class={styles.languageOptions}>
      {#each languages as language (language.code)}
        <li><button
          onclick={() => handleLanguageChange(language.code)}
          class:selected={styles.selected && selectedLanguage === language.code}
        >
          {language.name}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div> 