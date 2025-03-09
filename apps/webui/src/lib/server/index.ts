// This file marks the server directory as containing server-only modules
// SvelteKit will automatically prevent these modules from being imported in client-side code

// SvelteKit uses the .server.ts extension and $lib/server/* path to identify server-only modules
// No runtime checks are needed as SvelteKit handles this during the build process

export const SERVER_ONLY = true;

// Don't re-export database functions to avoid circular dependencies
// Instead, import them directly from the db.ts file
