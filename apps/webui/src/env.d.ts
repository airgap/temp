/**
 * Type definitions for environment variables
 */
declare module '$env/static/private' {
	export const PG_CONNECTION_STRING: string;
	export const ELASTIC_API_ENDPOINT: string;
	export const ELASTIC_API_KEY: string;
	export const ES_PROXY: any;
	export const REDIS_EXTERNAL_CONNECTION_STRING: string;
	export const REDIS_URL: string;
	export const REDIS_PASSWORD: string;
	// Add other private environment variables here as needed
}
