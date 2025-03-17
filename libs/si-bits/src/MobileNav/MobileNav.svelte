<script lang="ts">
	import { Backdrop } from '../Backdrop';
	import { NavLogo } from '../NavLogo';
	import { listen, shout } from '../Sonic';
	import { MobileNavLink } from '../MobileNavLink';
	import { UserRegistrationForm } from '../authForms';
	import groups from '../assets/group.svg?raw';
	import live from '../assets/live.svg?raw';
	import profileBlank from '../assets/profile.svg?raw';
	import play from '../assets/play.svg?raw';
	import styles from './MobileNav.module.sass';
	import { ProfilePicture } from '../ProfilePicture';
	import { cacheStore } from '../CacheProvider';
	const user = cacheStore.currentUser;
	let profile = $derived(user?.profilePicture);

	const { url, joinOrLogin } = $props<{ url: URL; joinOrLogin: () => void }>();
</script>

<div class={styles.MobileNavContainer}>
	<div class={styles.MobileNav}>
		<Backdrop />
		<!--<Link href="/leaderboards"><img src={gold} alt='Leaderboards'/></Link>-->
		<!--<Link href="/hot"><img src={fire} alt='Hot'/></Link>-->
		<MobileNavLink isActive={url?.pathname.startsWith('/live')} href="/live">
			{@html live}
		</MobileNavLink>
		<MobileNavLink isActive={url?.pathname.startsWith('/g')} href="/g">
			{@html groups}
		</MobileNavLink>
		<NavLogo class={styles.mainIcon} />
		<MobileNavLink isActive={url?.pathname.startsWith('/play')} href="/play">
			{@html play}
		</MobileNavLink>
		<!--<Link href="/search">-->
		<!--  <img src={search} alt="Search" />-->
		<!--</Link>-->
		<MobileNavLink
			href={user ? '/profile' : undefined}
			onclick={!user ? joinOrLogin : undefined}
		>
			<ProfilePicture src={profile} />
		</MobileNavLink>
	</div>
</div>
