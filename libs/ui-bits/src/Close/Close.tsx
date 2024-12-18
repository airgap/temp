import classnames from 'classnames';
import { FormEventHandler } from 'react';

import { Button } from '../Button';
import { Crosshatch } from '../Crosshatch';
import styles from './Close.module.sass';

type Props = {
	disabled?: boolean;
	className?: string;
	onClick?: FormEventHandler<HTMLButtonElement>;
};

/**
 * @noInheritDoc
 */
export const Close = (props: Props) => (
	<Button
		disabled={props.disabled}
		className={classnames(styles.Close, props.className)}
		onClick={props.onClick}
	>
		<Crosshatch width="20px" bright={true} />
	</Button>
);
