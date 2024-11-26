import {
	OneOfBsonSchema,
} from 'from-schema';
import { imageDoc } from './imageDoc';
import { videoDoc } from './videoDoc';

// Define the attachment schema as a union using "anyOf"
export const attachment = {
	oneOf: [videoDoc, imageDoc], // Use "anyOf" to represent the union
} as const satisfies OneOfBsonSchema;