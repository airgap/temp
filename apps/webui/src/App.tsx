import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { snap } from 'gsap/gsap-core';
import { api, sessionId } from 'monolith-ts-api';
import { useEffect } from 'react';
import {
	AuthOverlay,
	Backdrop,
	MobileNav,
	DesktopNav,
	NotificationOverlay,
	getHomepage,
	Footer,
	PostCreatorPopover,
	setCurrentUser,
	Error,
	ViewGames,
	ViewGroups,
	Hot,
	ViewPost,
	Profile,
	Roadmap,
	Stats,
	Stream,
	Tailored,
	UserPage,
	PlayGol,
	PlayTtf,
	PlayBtv,
	PlayEminence,
} from 'ui-bits';
import styles from './App.module.sass';
import { Route } from './Route';

gsap.registerPlugin(TextPlugin);

gsap.registerPlugin(snap);

// const pagePath = window.location.pathname ?? 'error';
// const pageName = getPageNameFromUrl();
// const lowerName = pageName.toLowerCase();
// if (pageName !== lowerName) window.location.pathname = lowerName;
// console.log('page', pageName);
export const App = () => {
	const loadCurrentUser = async () =>
		sessionId
			? api.streamCurrentUser().listen(setCurrentUser)
			: api.getCurrentUser().then(setCurrentUser);

	useEffect(() => {
		if (/^\/?$/.test(window.location.pathname))
			window.location.pathname = getHomepage();
		void loadCurrentUser();
		// loadCurrentChannel();
	}, []);
	return (
		<div className={styles.App}>
			<Backdrop />
			<DesktopNav />
			<br />
			<Route match={/^\/error/}>
				<Error />
			</Route>
			<Route match={/^\/tail(ored)?/}>
				<Tailored />
			</Route>
			<Route match={/^\/hot/}>
				<Hot />
			</Route>
			<Route match={/^\/groups/}>
				<ViewGroups />
			</Route>
			<Route match={/^\/p\//}>
				<ViewPost />
			</Route>
			<Route match={/^\/profile/}>
				<Profile />
			</Route>
			<Route match={/^\/demos\/gol/}>
				<PlayGol />
			</Route>
			<Route match={/^\/play\/?$/}>
				<ViewGames />
			</Route>
			<Route match={/^\/play\/flow/}>
				<PlayTtf />
			</Route>
			<Route match={/^\/play\/btv/}>
				<PlayBtv />
			</Route>
			<Route match={/^\/play\/eminence/}>
				<PlayEminence />
			</Route>
			<Route match={/^\/roadmap/}>
				<Roadmap />
			</Route>
			<Route match={/^\/stream/}>
				<Stream />
			</Route>
			<Route match={/^\/u(?:ser)?/}>
				<UserPage />
			</Route>
			<Route match={/^\/stats/}>
				<Stats />
			</Route>
			<Footer />
			<NotificationOverlay />
			<MobileNav />
			<AuthOverlay />
			<PostCreatorPopover />
		</div>
	);
};
