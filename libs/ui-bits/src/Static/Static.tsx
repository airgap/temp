import classnames from 'classnames';

import styles from './Static.module.sass';

type Props = { hidden?: boolean; width?: number; height?: number };

/**
 * @noInheritDoc
 */
export const Static = ({ width, height, hidden }: Props) => (
  <div
    style={{ width, height }}
    className={classnames(styles.Static, {
      [styles.hidden]: hidden,
    })}
  ></div>
);
