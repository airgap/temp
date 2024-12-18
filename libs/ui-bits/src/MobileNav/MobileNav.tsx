import { ReactNode, useEffect, useState } from 'react';

import { Backdrop } from '../Backdrop';
import { NavLogo } from '../NavLogo';
import { listen, shout } from '../Sonic';
import { MobileNavLink } from '../MobileNavLink';
import {
	// UserLoginForm,
	UserRegistrationForm,
} from '../authForms';
import groups from '../assets/group.svg';
import live from '../assets/live.svg';
import profileBlank from '../assets/profile.svg';
import play from '../assets/play.svg';
import styles from './MobileNav.module.sass';
import { ProfilePicture } from '../ProfilePicture';
import { useCurrentUser } from '../currentUserStore';
const showAuth = (form: ReactNode) => () => shout('showAuth', form);

export const MobileNav = () => {
	const user = useCurrentUser();
	const [profile, setProfile] = useState<string | undefined>(
		user?.profilePicture,
	);
	useEffect(() => {
		setProfile(user?.profilePicture);
	}, [user]);
	listen('profilePictureChanged', (id) => setProfile(id));
	return (
		<div className={styles.MobileNavContainer}>
			<div className={styles.MobileNav}>
				<Backdrop />
				{/*<Link href="/leaderboards"><img src={gold} alt='Leaderboards'/></Link>*/}
				{/*<Link href="/hot"><img src={fire} alt='Hot'/></Link>*/}
				<MobileNavLink href="/live">
					<img src={live} alt="Live" />
				</MobileNavLink>
				<MobileNavLink href="/g">
					<img src={groups} alt="ViewGroups" />
				</MobileNavLink>
				<NavLogo className={styles.mainIcon} />
				<MobileNavLink href="/play">
					<img src={play} alt="Play" />
				</MobileNavLink>
				{/*<Link href="/search">*/}
				{/*	<img src={search} alt="Search" />*/}
				{/*</Link>*/}
				<MobileNavLink
					{...(user
						? { href: '/profile' }
						: { onClick: showAuth(<UserRegistrationForm />) })}
				>
					<ProfilePicture url={profile ?? profileBlank} />
				</MobileNavLink>
			</div>
		</div>
	);
};
