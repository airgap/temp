import classnames from 'classnames';
import React, { FC, ReactNode } from 'react';

import styles from './Card.module.sass';

type Props = { children?: ReactNode; block?: boolean };

/**
 * @noInheritDoc
 */
export const Card: FC<Props> = ({ children, block = false }: Props) => (
  <div className={classnames(styles.card, { [styles.block]: block })}>
    {children}
  </div>
);
