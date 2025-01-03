import { TsonSchemaOrPrimitive, tsonToType } from 'from-schema';
import * as src from './';
import * as prettier from 'prettier';

const functions = `export type MonolithTypes = {
	${Object.entries(src)
		.map(([key, value]) => {
			// const requestType = 'request' in value ? j2t(value.request): undefined;
			// const responseType = 'response' in value ? j2t(value.response) : undefined;
			const request =
				'request' in value ? `request: ${tsonToType(value.request)},` : '';
			return `${key}: {${request}${
				'response' in value ? `response: ${tsonToType(value.response)},` : ''
			}${
				'stream' in value
					? `stream: ${
							typeof value.stream === 'boolean'
								? value.stream
								: `{
										tweakRequest: ${tsonToType(value.stream.tweakRequest)},
										tweakResponse:
											${
												'tweakResponse' in value.stream
													? tsonToType(
															value.stream
																.tweakResponse as TsonSchemaOrPrimitive
													  )
													: 'never'
											},
								  }`
					  },`
					: ''
			}}`;
		})
		.join(',\n')}
}`;

Bun.write(
	'../../dist/libs/mapi-types.d.ts',
	prettier.format(functions, { parser: 'typescript' })
);
