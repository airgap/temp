<script lang="ts">
	import styles from './Dropdown.module.sass';
	import classnames from 'classnames';

	type Option = {
		value: string;
		label: string;
	};

	let {
		value = $bindable(),
		options,
		placeholder = 'Select an option',
		class: className = '',
		disabled = false,
		onChange,
		suffix = '',
		suffixColor = '#ffaa00',
	} = $props<{
		value?: string;
		options: Option[];
		placeholder?: string;
		class?: string;
		disabled?: boolean;
		onChange?: (value: string) => void;
		suffix?: string;
		suffixColor?: string;
	}>();

	let isOpen = $state(false);
	let dropdownRef: HTMLDivElement;

	const selectedOption = $derived(options.find((opt) => opt.value === value));

	function handleSelect(option: Option) {
		value = option.value;
		isOpen = false;
		onChange?.(option.value);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return;

		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault();
				isOpen = !isOpen;
				break;
			case 'Escape':
				isOpen = false;
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (!isOpen) {
					isOpen = true;
				} else {
					const currentIndex = options.findIndex((opt) => opt.value === value);
					const nextIndex = (currentIndex + 1) % options.length;
					value = options[nextIndex].value;
					onChange?.(options[nextIndex].value);
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (!isOpen) {
					isOpen = true;
				} else {
					const currentIndex = options.findIndex((opt) => opt.value === value);
					const prevIndex =
						(currentIndex - 1 + options.length) % options.length;
					value = options[prevIndex].value;
					onChange?.(options[prevIndex].value);
				}
				break;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div
	bind:this={dropdownRef}
	class={classnames(styles.dropdown, className, {
		[styles.open]: isOpen,
		[styles.disabled]: disabled,
	})}
>
	<button
		type="button"
		class={styles.trigger}
		onclick={() => !disabled && (isOpen = !isOpen)}
		onkeydown={handleKeyDown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		{disabled}
	>
		<span class={styles.value}>
			{selectedOption ? selectedOption.label : placeholder}
			{#if suffix}
				<span class={styles.suffix} style="color: {suffixColor}">{suffix}</span>
			{/if}
		</span>
		<span class={styles.arrow}>▼</span>
	</button>

	{#if isOpen && !disabled}
		<ul class={styles.menu} role="listbox">
			{#each options as option}
				<li
					class={classnames(styles.option, {
						[styles.selected]: option.value === value,
					})}
					onclick={() => handleSelect(option)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleSelect(option);
						}
					}}
					role="option"
					aria-selected={option.value === value}
					tabindex="0"
				>
					{option.label}
				</li>
			{/each}
		</ul>
	{/if}
</div>
