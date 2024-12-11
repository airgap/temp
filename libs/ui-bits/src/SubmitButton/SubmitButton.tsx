import { MouseEventHandler, ReactNode } from 'react';

import styles from './SubmitButton.module.sass';

/**
 * @noInheritDoc
 */
export const SubmitButton = (props: {
  children?: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => (
  <button
    className={styles.SubmitButton}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.children}
  </button>
);
