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
  import Plus from '../assets/plus.svg?raw';

  const showAuth = (form: any) => () => shout('showAuth', form);
  import { createEventDispatcher } from 'svelte';
	import type { string } from '../../../../../from-schema/dist/bson/primitives';
	import type { User } from '@lyku/json-models';
  import { ProfilePicture } from '../ProfilePicture';
	// import { currentUser } from '../currentUserStore';
// const user = $currentUser;
  const { user, sessionId, url, onjoin, onlogin, oncreate } = $props<{ user?: User; sessionId: string; url?: URL, onjoin: () => void, onlogin: () => void, oncreate?: () => void }>();
  console.log('user', user);
</script>

<div class={styles.DesktopNav}>
  <div class={styles.DesktopNavContainer}>
    <div class={styles.InnerDesktopNav}>
      <Backdrop />
      <NavLogo />
      {#if user}
        <CoolLink href="/tail" isActive={url?.pathname.startsWith('/tail')}>{phrasebook.navTailored}</CoolLink>
      {/if}
      <CoolLink href="/hot" isActive={url?.pathname.startsWith('/hot')}>{phrasebook.navHot}</CoolLink>
      <CoolLink href="/play" isActive={url?.pathname.startsWith('/play')}>{phrasebook.navPlay}</CoolLink>

      <span class={styles.cluster}>
        {#if user}
          <span class={styles.welcome}>
            {phrasebook.navWelcome}
            <Link href="/u/{user.slug}">
              <span>{user.username}!</span>
              <ProfilePicture
                shape="circle"
                size="s"
                src={user.profilePicture}
              />
            </Link>
            <span class={styles.badgeHolder}>
              <LevelBadge points={user.points ?? 0n} progress={true} />
            </span>
            <Link onclick={oncreate} className={styles.plus}>
              {@html Plus}
            </Link>
          </span>
        {:else}
          <Link onclick={onjoin}>
            {phrasebook.navRegister}
          </Link>
          <Link onclick={onlogin}>
            {phrasebook.navLogin}
          </Link>
        {/if}
        <Lingo />
      </span>
    </div>
  </div>
  <div class={styles.DesktopNavSpacer}></div>
</div>
