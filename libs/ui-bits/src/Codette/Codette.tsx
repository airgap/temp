import classnames from 'classnames';
import React, { FC, ReactNode } from 'react';

import styles from './Codette.module.sass';

type Props = { children?: ReactNode; dense?: boolean };

/**
 * @noInheritDoc
 */
export const Codette: FC<Props> = ({ children, dense = false }: Props) => (
  <span className={classnames(styles.Codette, { [styles.dense]: dense })}>
    {children}
  </span>
);
