import { Stream } from '@cloudflare/stream-react';
import classnames from 'classnames';
import React, { useRef, useState } from 'react';

import { Aerial } from '../Aerial';
import { Screensaver } from '../Screensaver';
import { Static } from '../Static';
import { TvFrame } from '../TvFrame';
import styles from './Tv.module.sass';
import { Channel } from '@lyku/json-models';

type Props = {
	channel?: Channel;
	showStatic?: boolean;
	children?: React.ReactNode;
};

export const Tv: React.FC<Props> = ({ channel, showStatic, children }) => {
	const frameRef = useRef<HTMLDivElement>(null);
	const [ready, setReady] = useState(false);
	const [height, setHeight] = useState(480);
	const [loading, setLoading] = useState(false);

	const hideStream = () => {
		console.log('Done streaming!');
		setHeight(480);
		setReady(false);
		setLoading(false);
		if (frameRef.current) {
			frameRef.current.style.height = '480px';
		}
	};

	const nowReady = (e: Event) => {
		showStream(e);
	};

	const showStream = (e: Event) => {
		console.log('Now streaming!');
		const streamHeight = document.getElementsByClassName(styles.Stream)[0]
			.clientHeight;
		if (frameRef.current) {
			frameRef.current.style.height = `${streamHeight}px`;
		}
		setHeight(streamHeight);
		setReady(true);
	};

	const loadStart = () => {
		setLoading(true);
	};

	return (
		<div className={styles.Tv}>
			<Aerial loading={loading} />
			<TvFrame height={height}>
				<Screensaver channel={channel} ready={ready}>
					{children}
				</Screensaver>
				{channel?.whepKey && (
					<div
						className={classnames(styles.StreamBox, {
							[styles.inactive]: !ready,
						})}
					>
						<Stream
							className={styles.Stream}
							src={channel?.whepKey}
							onError={hideStream}
							onEnded={hideStream}
							onLoadStart={loadStart}
							onCanPlay={nowReady}
							controls
							autoplay={true}
						/>
					</div>
				)}
				<Static hidden={!showStatic} />
			</TvFrame>
		</div>
	);
};

export default Tv;
