import classnames from 'classnames';
import styles from './Loading.module.sass';

export const Loading = (props: {
	floating?: boolean;
	visible?: boolean;
	reverse?: boolean;
	speed?: number;
}) => (
	<div
		className={classnames(
			styles.Loading,
			{
				[styles.floating]: props.floating,
				[styles.visible]: props.visible ?? true,
				[styles.reverse]: props.reverse,
			},
			props.speed &&
				props.speed >= 10 &&
				[
					styles.s10,
					styles.s20,
					styles.s30,
					styles.s40,
					styles.s50,
					styles.s60,
					styles.s70,
					styles.s80,
					styles.s90,
				][Math.floor(props.speed / 10)]
		)}
	>
		<div>
			<div>
				<div />
			</div>
		</div>
	</div>
);
