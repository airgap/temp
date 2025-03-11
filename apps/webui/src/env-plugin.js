/**
 * Custom Vite plugin to handle environment variables in SvelteKit
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../../..');
const envFile = resolve(rootDir, '.env');

// Load environment variables from .env file
config({ path: envFile });

/**
 * Creates a Vite plugin that handles environment variables properly
 */
export function svelteKitEnv() {
	// Store process.env values that we need at the time this module is loaded
	const processEnv = { ...process.env };

	return {
		name: 'vite-plugin-sveltekit-env',

		// Replace $env/static/private imports with actual values at build time
		resolveId(id) {
			if (id === '$env/static/private') {
				return id;
			}
			return null;
		},

		load(id) {
			if (id === '$env/static/private') {
				// Generate a module that exports all environment variables
				let code = 'export {';

				// Add the PG_CONNECTION_STRING
				if (processEnv.PG_CONNECTION_STRING) {
					code += `\n  PG_CONNECTION_STRING: "${processEnv.PG_CONNECTION_STRING}",`;
				} else {
					code += '\n  PG_CONNECTION_STRING: "",';
				}

				// Add other env vars as needed
				// ...

				code += '\n}';
				return code;
			}
			return null;
		},
	};
}
