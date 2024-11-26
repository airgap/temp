import { b2t, j2t } from 'from-schema';
import * as src from './';
import * as prettier from 'prettier';

const functions = `export type MonolithTypes = {
	${Object.entries(src).map(([key, value]) => {
		// const requestType = 'request' in value ? j2t(value.request): undefined;
		// const responseType = 'response' in value ? j2t(value.response) : undefined;
		return `${key}: {${'request' in value ? `request: ${j2t(value.request)},` : ''}${'response' in value ? `response: ${j2t(value.response)},` : ''}${'stream' in value ? `stream: ${j2t(value.stream)},` : ''}}`;
	}).join(',\n')}
}`;

console.log(prettier.format(functions, { parser: 'typescript' }));
