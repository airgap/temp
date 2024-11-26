import { ReactNode } from 'react';
import styles from './LeftAlign.module.sass';
export const LeftAlign = ({ children }: { children: ReactNode }) => (
	<div className={styles.LeftAlign}>{children}</div>
);
