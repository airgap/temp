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
	import search from '../assets/search.svg?raw';
	import Cube from '../Cube.svelte';
	const user = cacheStore.currentUser;
	let profile = $derived(user?.profilePicture);

	const { url, joinOrLogin, onSearchClick } = $props<{
		url: URL;
		joinOrLogin: () => void;
		onSearchClick?: () => void;
	}>();
</script>

<div class={styles.MobileNavContainer}>
	<div class={styles.MobileNav}>
		<Backdrop />
		<!--<Link href="/leaderboards"><img src={gold} alt='Leaderboards'/></Link>-->
		<!--<Link href="/hot"><img src={fire} alt='Hot'/></Link>-->
		<!-- <MobileNavLink isActive={url?.pathname.startsWith('/live')} href="/live">
			{@html live}
		</MobileNavLink> -->
		<MobileNavLink onClick={onSearchClick}>
			{@html search}
		</MobileNavLink>
		<MobileNavLink isActive={/^\/g(\/|$)/.test(url?.pathname)} href="/g/">
			{@html groups}
		</MobileNavLink>
		<!-- <NavLogo class={styles.mainIcon} /> -->
		<MobileNavLink><Cube /></MobileNavLink>
		<MobileNavLink isActive={/^\/p(\/|$)/.test(url?.pathname)} href="/p/">
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
