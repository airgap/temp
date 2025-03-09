// This file ensures that SvelteKit treats this directory as server-only
// It's an empty endpoint that won't be called, but its presence marks the directory

export function GET() {
	return new Response('This is a server-only directory', { status: 404 });
}
