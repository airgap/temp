import { TsonSchemaOrPrimitive, tsonToType } from 'from-schema';
import * as src from '@lyku/mapi-models';
import * as prettier from 'prettier';
import fs from 'fs';
const reqKeys = {};
const resKeys = {};
const reqTypes = {};
const resTypes = {};
const tweakReqKeys = {};
const tweakResKeys = {};
const tweakReqTypes = {};
const tweakResTypes = {};

let unformatted = '';
let fns = '';

const types = Object.entries(src).map(([key, value]) => {
	const upperKey = key[0].toUpperCase() + key.slice(1);
	const requestKey = upperKey + 'Request';
	const responseKey = upperKey + 'Response';
	const requestType = 'request' in value ? tsonToType(value.request) : 'never';
	const responseType =
		'response' in value ? tsonToType(value.response) : 'never';
	reqKeys[key] = requestKey;
	resKeys[key] = responseKey;
	reqTypes[key] = requestType;
	resTypes[key] = responseType;
	fns += `export type ${requestKey} = ${requestType};\n`;
	fns += `export type ${responseKey} = ${responseType};\n`;
	if ('stream' in value && typeof value.stream === 'object') {
		const trk = upperKey + 'TweakRequest';
		tweakReqKeys[key] = trk;
		if ('tweakRequest' in value.stream)
			fns += `export type ${trk} = ${tsonToType(value.stream.tweakRequest)};\n`;
		const reskey = upperKey + 'TweakResponse';
		tweakResKeys[key] = reskey;
		if ('tweakResponse' in value.stream)
			fns += `export type ${reskey} = ${tsonToType(
				value.stream.tweakResponse,
			)};\n`;
	}
});

const functions = `${fns}
export type MonolithTypes = {
	${Object.entries(src)
		.map(([key, value]) => {
			// const requestType = 'request' in value ? j2t(value.request): undefined;
			// const responseType = 'response' in value ? j2t(value.response) : undefined;
			const request = 'request' in value ? `request: ${reqKeys[key]},` : '';
			return `${key}: {${request}${
				'response' in value ? `response: ${resKeys[key]},` : ''
			}${
				'stream' in value
					? `stream: ${
							typeof value.stream === 'boolean'
								? `{tweakRequest: never, tweakResponse: never}`
								: `{
										tweakRequest: ${tweakReqKeys[key]},
										tweakResponse:
											${'tweakResponse' in value.stream ? tweakResKeys[key] : 'never'},
								  }`
						},`
					: ''
			}}`;
		})
		.join(',\n')}
}`;
fs.mkdirSync('../../dist/libs/mapi-types', { recursive: true });
fs.copyFileSync('package.json', '../../dist/libs/mapi-types/package.json');
fs.writeFileSync(
	'../../dist/libs/mapi-types/index.d.ts',
	prettier.format(functions, { parser: 'typescript' }),
);
