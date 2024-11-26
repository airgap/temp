import { ReactNode } from 'react';

import styles from './Route.module.sass';

export const Route = ({
	match,
	children,
}: {
	match: RegExp;
	children: ReactNode;
}) =>
	match.test(window.location.pathname) && (
		<div className={styles.Route}>{children}</div>
	);
