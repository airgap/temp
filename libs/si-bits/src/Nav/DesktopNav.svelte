<script lang="ts">
	import { LevelBadge } from '../LevelBadge';
	import { Backdrop } from '../Backdrop';
	import { Image } from '../Image';
	import { Link } from '../Link';
	import groups from '../assets/group.svg?raw';
	// import hot from '../assets/hot.svg?raw';
	import play from '../assets/play.svg?raw';
	import { CoolLink } from '../CoolLink';
	import { NavLogo } from '../NavLogo';
	import { shout } from '../Sonic';
	import { UserLoginForm, UserRegistrationForm } from '../authForms';
	import { phrasebook } from '../phrasebook';
	import styles from './DesktopNav.module.sass';
	import { Lingo } from '../Lingo';
	import Plus from '../assets/plus.svg?raw';
	import pen from '../assets/pen.png';

	const showAuth = (form: any) => () => shout('showAuth', form);
	import { createEventDispatcher } from 'svelte';
	import type { string } from '../../../../../from-schema/dist/bson/primitives';
	import type { User } from '@lyku/json-models';
	import { ProfilePicture } from '../ProfilePicture';
	import { Search } from '../Search';
	import BubbleButton from '../BubbleButton/BubbleButton.svelte';
	// import { currentUser } from '../currentUserStore';
	// const user = $currentUser;
	const { user, sessionId, url, onjoin, onlogin, oncreate } = $props<{
		user?: User;
		sessionId: string;
		url?: URL;
		onjoin: () => void;
		onlogin: () => void;
		oncreate?: () => void;
	}>();
	console.log('DesktopNav user', user);
</script>

<div class={styles.DesktopNav}>
	<div class={styles.DesktopNavContainer}>
		<div class={styles.InnerDesktopNav}>
			<Backdrop />
			<NavLogo />
			<Search />
			<BubbleButton href="/g/" isActive={/^\/g(\/|$)/.test(url?.pathname)}>
				{phrasebook.navGroups}
				<!-- {@html groups} -->
			</BubbleButton>
			<BubbleButton href="/p/" isActive={/^\/p(\/|$)/.test(url?.pathname)}>
				{phrasebook.navPlay}
				<!-- {@html play} -->
			</BubbleButton>

			<span class={[styles.cluster, user ? styles.loggedIn : styles.guest]}>
				{#if user}
					<span class={styles.welcome}>
						<Link onclick={oncreate} class={styles.createPost}>
							<img src={pen} alt="Pen post" />
						</Link>
						<!--{phrasebook.navWelcome}-->
						<Link href="/u/{user.slug}">
							<!--<span>{user.username}!</span>-->
							<ProfilePicture
								shape="circle"
								size="s"
								src={user.profilePicture?.toString()}
							/>
						</Link>
						<Link>
							<LevelBadge points={user.points ?? 0n} progress={true} />
						</Link>
					</span>
				{:else}
					<BubbleButton onclick={onlogin}>
						{phrasebook.navLogin}
					</BubbleButton>
					<BubbleButton onclick={onjoin} variant="primary">
						{phrasebook.navRegister}
					</BubbleButton>
				{/if}
				<!-- <Lingo /> -->
			</span>
		</div>
	</div>
	<div class={styles.DesktopNavSpacer}></div>
</div>
