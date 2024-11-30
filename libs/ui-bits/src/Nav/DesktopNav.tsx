import { ReactNode } from 'react';
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
import { useCurrentUser } from '../currentUserStore';
// import { getDocsPage } from '../linkToDocs';
import { sessionId } from 'monolith-ts-api';

const showAuth = (form: ReactNode) => () => shout('showAuth', form);

export const DesktopNav = () => {
	const user = useCurrentUser();
	return (
		<div className={styles.DesktopNav}>
			<div className={styles.DesktopNavContainer}>
				<div className={styles.InnerDesktopNav}>
					<Backdrop />
					<NavLogo />
					{user && sessionId && (
						<CoolLink href="/tail">
							{phrasebook.navTailored}
						</CoolLink>
					)}
					<CoolLink href="/hot">{phrasebook.navHot}</CoolLink>
					<CoolLink href="/play">{phrasebook.navPlay}</CoolLink>
					{/*<CoolLink href={getDocsPage()} target="_blank">*/}
					{/*	Code*/}
					{/*</CoolLink>*/}
					{/* <Link href="/roadmap">Roadmap</Link> */}
					<span className={styles.cluster}>
						{user && sessionId ? (
							<span className={styles.welcome}>
								{phrasebook.navWelcome}{' '}
								<Link href="/profile">
									<span>{user.username}!</span>{' '}
									<Image
										shape={'circle'}
										size={'s'}
										id={user.profilePicture}
									/>
								</Link>
								<span className={styles.badgeHolder}>
									<LevelBadge
										points={user.points ?? 0}
										progress={true}
									/>
								</span>
							</span>
						) : (
							<>
								<Link
									onClick={showAuth(<UserRegistrationForm />)}
								>
									{phrasebook.navRegister}
								</Link>
								<Link onClick={showAuth(<UserLoginForm />)}>
									{phrasebook.navLogin}
								</Link>
							</>
						)}
						<Lingo />
					</span>
				</div>
			</div>
			<div className={styles.DesktopNavSpacer}></div>
		</div>
	);
};
