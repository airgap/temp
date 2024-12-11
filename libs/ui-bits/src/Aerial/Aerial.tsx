import classnames from 'classnames';

import styles from './Aerial.module.sass';

export const Aerial = ({ loading }: { loading?: boolean }) => (
  <div className={styles.aerialContainer}>
    <div
      className={classnames(styles.Aerial, {
        [styles.loading]: loading,
      })}
    ></div>
  </div>
);
