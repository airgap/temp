import { ServerResponse } from 'http';
import { CompactedPhrasebook } from '@lyku/phrasebooks';

export const ender =
	(res: ServerResponse, phrasebook: CompactedPhrasebook) =>
	(thing: unknown, code = 200, headers?: Record<string, string>) => {
		if (headers)
			for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
		res.statusCode = code;
		const str = String(code);
		if (str in phrasebook && typeof phrasebook[str] === 'string')
			res.statusMessage = phrasebook[str];
		res.end(typeof thing === 'string' ? thing : JSON.stringify(thing));
	};
