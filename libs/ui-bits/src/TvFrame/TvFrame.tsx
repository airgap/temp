import classnames from 'classnames';
import { ReactNode } from 'react';

import styles from './TvFrame.module.sass';

type Props = {
  children?: ReactNode;
  size?: 'auto';
  height?: number;
  // ref?: RefObject<HTMLDivElement>;
};

/**
 * @noInheritDoc
 */
export const TvFrame = ({ children, size, height }: Props) => (
  <div
    className={classnames(styles.TvFrame, {
      [styles.auto]: size === 'auto',
    })}
    style={{ height }}
  >
    {children}
  </div>
);
