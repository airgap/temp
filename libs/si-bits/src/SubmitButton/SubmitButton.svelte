<script lang="ts">
	import styles from './SubmitButton.module.sass';

	const { className, disabled, children, ...rest } = $props<
		{
			className?: string;
			disabled: boolean;
			children: [];
			onclick: () => void;
		} & any
	>();
</script>

<button class={styles.SubmitButton} class:className {disabled} {...rest}>
	{@render children?.()}
</button>
