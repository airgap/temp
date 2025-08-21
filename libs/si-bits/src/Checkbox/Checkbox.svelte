<script lang="ts">
	import checkIcon from '../assets/check.svg';
	import type { Snippet } from 'svelte';

	interface Props {
		checked?: boolean;
		disabled?: boolean;
		id?: string;
		name?: string;
		label?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		onchange?: (event: Event) => void;
		onclick?: (event: MouseEvent) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
		children?: Snippet;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		id,
		name,
		label,
		ariaLabel,
		ariaDescribedby,
		onchange,
		onclick,
		onfocus,
		onblur,
		children,
	}: Props = $props();
</script>

<label class="checkbox-wrapper" class:disabled>
	<input
		type="checkbox"
		bind:checked
		{onchange}
		{onclick}
		{onfocus}
		{onblur}
		{disabled}
		{id}
		{name}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
	/>
	<span class="checkbox-visual" class:checked>
		{#if checked}
			<img src={checkIcon} alt="" class="check-icon" />
		{/if}
	</span>
	{#if children}
		<span class="checkbox-label">
			{@render children()}
		</span>
	{:else if label}
		<span class="checkbox-label">
			{label}
		</span>
	{/if}
</label>

<style>
	.checkbox-wrapper {
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
		gap: 0.5rem;
	}

	.checkbox-wrapper.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	input[type='checkbox'] {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.checkbox-visual {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #ccc;
		border-radius: 0.25rem;
		background-color: #fff;
		transition: all 0.2s ease;
	}

	.checkbox-visual.checked {
		background-color: #3b82f6;
		border-color: #3b82f6;
	}

	.checkbox-visual:hover:not(.disabled) {
		border-color: #3b82f6;
	}

	input[type='checkbox']:focus-visible + .checkbox-visual {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.check-icon {
		width: 0.875rem;
		height: 0.875rem;
		animation: checkIn 0.2s ease;
	}

	.checkbox-label {
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #1f2937;
	}

	@keyframes checkIn {
		from {
			transform: scale(0);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
