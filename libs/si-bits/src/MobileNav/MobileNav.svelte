<script lang="ts">
  import { Backdrop } from '../Backdrop';
  import { NavLogo } from '../NavLogo';
  import { listen, shout } from '../Sonic';
  import { MobileNavLink } from '../MobileNavLink';
  import { UserRegistrationForm } from '../authForms';
  import groups from '../assets/group.svg';
  import live from '../assets/live.svg';
  import profileBlank from '../assets/profile.svg';
  import play from '../assets/play.svg';
  import styles from './MobileNav.module.sass';
  import { ProfilePicture } from '../ProfilePicture';
  import { useCurrentUser } from '../currentUserStore';

  const showAuth = (form: any) => () => shout('showAuth', form);
  const user = useCurrentUser();
  let profile = user?.profilePicture;

  $: if (user) {
    profile = user.profilePicture;
  }

  listen('profilePictureChanged', (id) => profile = id);
</script>

<div class={styles.MobileNavContainer}>
  <div class={styles.MobileNav}>
    <Backdrop />
    <!--<Link href="/leaderboards"><img src={gold} alt='Leaderboards'/></Link>-->
    <!--<Link href="/hot"><img src={fire} alt='Hot'/></Link>-->
    <MobileNavLink href="/live">
      <img src={live} alt="Live" />
    </MobileNavLink>
    <MobileNavLink href="/g">
      <img src={groups} alt="ViewGroups" />
    </MobileNavLink>
    <NavLogo class={styles.mainIcon} />
    <MobileNavLink href="/play">
      <img src={play} alt="Play" />
    </MobileNavLink>
    <!--<Link href="/search">-->
    <!--  <img src={search} alt="Search" />-->
    <!--</Link>-->
    <MobileNavLink
      href={user ? '/profile' : undefined}
      on:click={!user ? showAuth(UserRegistrationForm) : undefined}
    >
      <ProfilePicture url={profile ?? profileBlank} />
    </MobileNavLink>
  </div>
</div> 