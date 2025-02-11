import type { OneOfTsonSchema } from 'from-schema';
import { imageDoc } from './imageDoc';
import { cloudflareVideoDoc } from './videoDoc';

// Define the attachment schema as a union using "anyOf"
// export const attachment = {
//   oneOf: [cloudflareVideoDoc, imageDoc], // Use "anyOf" to represent the union
// } as const satisfies OneOfTsonSchema;
