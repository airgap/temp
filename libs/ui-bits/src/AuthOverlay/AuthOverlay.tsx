import classnames from 'classnames';
import { ReactNode, useEffect, useState } from 'react';

import { LoadingOverlay } from '../LoadingOverlay';
import { listen } from '../Sonic';
import hidden from '../hidden.module.sass';
import styles from './AuthOverlay.module.sass';

export const AuthOverlay = () => {
  const [form, setForm] = useState<ReactNode>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    listen('showAuth', setForm);
    listen('submitClicked', () => setLoading(true));
    listen('formReplied', () => setLoading(false));
  }, []);
  return (
    <div
      className={classnames(styles.AuthOverlay, {
        [hidden.hidden]: !form,
      })}
    >
      <div className={styles.AuthForm}>
        <div
          className={classnames(styles.interactives, {
            [hidden.hidden]: loading,
          })}
        >
          <button
            className={styles.Close}
            onClick={() => setForm(undefined)}
          ></button>
          {form}
        </div>
        <LoadingOverlay shown={loading} />
      </div>
    </div>
  );
};
