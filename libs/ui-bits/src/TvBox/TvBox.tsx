import { ReactNode } from 'react';

import styles from './TvBox.module.sass';

type Props = { children?: ReactNode };

export const TvBox = ({ children }: Props) => (
  <div className={styles.TvBox}>{children}</div>
);
