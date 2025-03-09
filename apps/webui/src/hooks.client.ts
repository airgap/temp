// This file can be used for client-side initialization
// It's automatically loaded by SvelteKit before any page is rendered

export function handleError({ error, event }: { error: unknown; event: any }) {
	console.error('Client-side error:', error);

	// Custom error handling
	const errorWithCode = error as { code?: string };

	return {
		message: 'An unexpected error occurred.',
		code: errorWithCode?.code || 'UNKNOWN',
	};
}
