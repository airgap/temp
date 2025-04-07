<script lang="ts">
	import styles from './SubmitButton.module.sass';

	const { className, disabled, children, onClick, ...rest } = $props<
		{
			className?: string;
			disabled: boolean;
			children: [];
			onClick: () => void;
		} & any
	>();
</script>

<button
	class={styles.SubmitButton}
	class:className
	{disabled}
	{...rest}
	onclick={onClick}
>
	{@render children?.()}
</button>
