import { ReactNode } from 'react';

import './FuckButton';
import styles from './FuckButton.module.sass';

export const FuckButton = ({ children }: { children: ReactNode }) => (
  <button className={styles.FuckYeah}>{children}</button>
);
