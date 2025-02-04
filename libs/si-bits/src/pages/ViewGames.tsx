import { api } from 'monolith-ts-api';
import { GameStatus } from '@lyku/json-models';
import { Thumbnail } from '../Thumbnail';
import { phrasebook } from '../phrasebook';
import styles from './ViewGames.module.sass';
import classNames from 'classnames';
import { sortGamesByPrecedence } from '../sortGamesByPrecedence';
import { Await } from 'awaitx';

// CSS classes for various game statuses
const statusClasses = {
	planned: styles.planned,
	wip: styles.wip,
	ea: styles.ea,
	ga: styles.ga,
	maintenance: styles.maintenance,
} satisfies Record<GameStatus, string>;

export const ViewGames = () => (
	<div style={{ textAlign: 'center' }}>
		<Await
			source={() => api.listGames({}).then(sortGamesByPrecedence)}
			then={(games) =>
				games.map(({ id, homepage, title, status, thumbnail }) => (
					<a
						className={classNames(styles.game, statusClasses[status])}
						id={id.toString()}
						key={id}
						style={{ display: 'inline-block', margin: '10px' }}
						href={homepage}
					>
						<Thumbnail alt={title} url={thumbnail} />
						<label htmlFor={id.toString()}>
							{title}
							{status !== 'ga' && <div>[ {phrasebook[status]} ]</div>}
						</label>
					</a>
				))
			}
			fail={(error) => String(error)}
		/>
	</div>
);
