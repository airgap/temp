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
	import pen from '../pen.png';

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
	console.log('user', user);
</script>

<div class={styles.DesktopNav}>
	<div class={styles.DesktopNavContainer}>
		<div class={styles.InnerDesktopNav}>
			<Backdrop />
			<NavLogo />
			<Search />
			<!-- {#if user} -->
			<BubbleButton href="/" isActive={url?.pathname === '/'}
				>{phrasebook.navFeed}</BubbleButton
			>
			<!-- {/if} -->
			<BubbleButton href="/hot" isActive={url?.pathname.startsWith('/g')}
				>{phrasebook.navGroups}</BubbleButton
			>
			<BubbleButton href="/play" isActive={url?.pathname.startsWith('/p')}
				>{phrasebook.navPlay}</BubbleButton
			>

			<span class={styles.cluster}>
				{#if user}
					<span class={styles.welcome}>
						<Link onclick={oncreate} className={styles.createPost}>
							<img src={pen} alt="Pen post" />
						</Link>
						<!--{phrasebook.navWelcome}-->
						<Link href="/u/{user.slug}">
							<!--<span>{user.username}!</span>-->
							<ProfilePicture
								shape="circle"
								size="s"
								src={user.profilePicture}
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
