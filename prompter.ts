#!bun

const term = process.argv[2];

if (!term) {
	console.log('Usage: prompter <term>');
	process.exit(1);
}

console.log(
	`Migrate ${term}.tsx to ${term}.svelte while preserving the \`import styles from './${term}.module.sass';\``
);
