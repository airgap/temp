<script lang="ts">
  import { LevelBadge } from '../LevelBadge';
  import { Backdrop } from '../Backdrop';
  import { Image } from '../Image';
  import { Link } from '../Link';
  import { CoolLink } from '../CoolLink';
  import { NavLogo } from '../NavLogo';
  import { shout } from '../Sonic';
  import { UserLoginForm, UserRegistrationForm } from '../authForms';
  import { phrasebook } from '../phrasebook';
  import styles from './DesktopNav.module.sass';
  import { Lingo } from '../Lingo';
  import { cacheStore } from '../CacheProvider';
  import { getSessionId } from 'monolith-ts-api';

  let user = cacheStore.currentUser;
  export let url: URL;

  const showAuth = (form: any) => () => shout('showAuth', form);
</script>

<div class={styles.DesktopNav}>
  <div class={styles.DesktopNavContainer}>
    <div class={styles.InnerDesktopNav}>
      <Backdrop />
      <NavLogo />
      {#if user && getSessionId()}
        <CoolLink href="/tail" isActive={url.pathname.startsWith('/tail')}>{phrasebook.navTailored}</CoolLink>
      {/if}
      <CoolLink href="/hot" isActive={url.pathname.startsWith('/hot')}>{phrasebook.navHot}</CoolLink>
      <CoolLink href="/play" isActive={url.pathname.startsWith('/play')}>{phrasebook.navPlay}</CoolLink>
      
      <span class={styles.cluster}>
        {#if user && sessionId}
          <span class={styles.welcome}>
            {phrasebook.navWelcome}
            <Link href="/profile">
              <span>{user.username}!</span>
              <Image
                shape="circle"
                size="s"
                url={user.profilePicture}
              />
            </Link>
            <span class={styles.badgeHolder}>
              <LevelBadge points={user.points ?? 0} progress={true} />
            </span>
          </span>
        {:else}
          <Link on:click={showAuth(UserRegistrationForm)}>
            {phrasebook.navRegister}
          </Link>
          <Link on:click={showAuth(UserLoginForm)}>
            {phrasebook.navLogin}
          </Link>
        {/if}
        <Lingo />
      </span>
    </div>
  </div>
  <div class={styles.DesktopNavSpacer}></div>
</div> 