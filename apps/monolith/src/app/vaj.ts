import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export const ajvConfig = {
	validateFormats: false,
	removeAdditional: 'all',
	additionalProperties: true,
	strict: false,
} as const;
export const vaj = new Ajv(ajvConfig);
addFormats(vaj);
