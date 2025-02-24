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
  

  const showAuth = (form: any) => () => shout('showAuth', form);
  import { createEventDispatcher } from 'svelte';
	import type { string } from '../../../../../from-schema/dist/bson/primitives';
	import type { User } from '@lyku/json-models';
	// import { currentUser } from '../currentUserStore';
  const dispatch = createEventDispatcher();
  const join = () => dispatch('join');
  const login = () => dispatch('login');
// const user = $currentUser;
  const { user, sessionId, url } = $props<{ user: User; sessionId: string; url: URL }>();
  console.log('user', user);
</script>

<div class={styles.DesktopNav}>
  <div class={styles.DesktopNavContainer}>
    <div class={styles.InnerDesktopNav}>
      <Backdrop />
      <NavLogo />
      {#if $user}
        <CoolLink href="/tail" isActive={url.pathname.startsWith('/tail')}>{phrasebook.navTailored}</CoolLink>
      {/if}
      <CoolLink href="/hot" isActive={url.pathname.startsWith('/hot')}>{phrasebook.navHot}</CoolLink>
      <CoolLink href="/play" isActive={url.pathname.startsWith('/play')}>{phrasebook.navPlay}</CoolLink>
      
      <span class={styles.cluster}>
        {#if $user}
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
              <LevelBadge points={user.points ?? 0n} progress={true} />
            </span>
          </span>
        {:else}
          <Link on:click={join}>
            {phrasebook.navRegister}
          </Link>
          <Link on:click={login}>
            {phrasebook.navLogin}
          </Link>
        {/if}
        <Lingo />
      </span>
    </div>
  </div>
  <div class={styles.DesktopNavSpacer}></div>
</div> 