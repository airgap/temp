import { FromSchema } from 'from-schema';
import { IncomingMessage } from 'http';
import { CompactedPhrasebook } from 'phrasebooks';

import { HardenedState } from './types/State';

export type Route<Request, Response> = {
	authenticated: boolean;
	validate: () => boolean;
	respond: (
		params: FromSchema<Request>,
		state: HardenedState,
		req: IncomingMessage,
		strings: CompactedPhrasebook,
	) => FromSchema<Response> | Promise<FromSchema<Response>>;
};
