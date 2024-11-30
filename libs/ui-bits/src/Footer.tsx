import { Divisio } from './Divisio';
import {pipe} from '@lyku/stats';
import { Center } from './Center';
import { Link, phrasebook } from './';

export const Footer = () => (
	<div
		style={{
			opacity: 0.5,
			marginTop: 'auto',
			padding: '5px',
		}}
	>
		<Center>
			<Divisio size={'l'} layout={'h'} alignItems={'center'}>
				<span>&copy; 2017-2024 lyku.org</span>|
				<span>
					alpha version <Link href="/stats">0.{pipe}</Link>
				</span>
				|
				<span>
					Join the{' '}
					<Link href="https://discord.gg/ZAJsBhujyG">
						{phrasebook.navDiscord}
					</Link>
				</span>
			</Divisio>
		</Center>
	</div>
);
