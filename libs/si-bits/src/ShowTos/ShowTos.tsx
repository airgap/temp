import { ReactNode } from 'react';

import styles from './ShowTos.module.sass';

type Props = {
	children?: ReactNode;
};

export const ShowTos = ({ children }: Props) => (
	<button
		className={styles.ShowTos}
		onClick={() => window.dispatchEvent(new CustomEvent('showTos'))}
	>
		{children}
	</button>
);
