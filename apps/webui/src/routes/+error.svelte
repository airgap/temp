<script>
	import { page } from '$app/stores';
</script>

<div class="error-container">
	<h1>{$page.status}: {$page.error?.message}</h1>
	<p>Sorry, something went wrong.</p>
	<a href="/">Go back home</a>
</div>

<style>
	.error-container {
		padding: 2rem;
		text-align: center;
	}
	h1 {
		color: #ff3e00;
		margin-bottom: 1rem;
	}
	a {
		color: #0066cc;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
