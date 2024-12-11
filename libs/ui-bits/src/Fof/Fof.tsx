import React, { ReactNode } from 'react';

import styles from './Fof.module.sass';

type Props = {
  children?: ReactNode;
};

export const Fof = (props: Props) => (
  <div className={styles.Fof}>
    <h1>{props.children}</h1>
  </div>
);
