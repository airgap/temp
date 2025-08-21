<script>
	import { Dialog } from '../Dialog';
	import { Texticle } from '../Texticle';
	import { Checkbox } from '../Checkbox';
	import { Spinner } from '../Spinner';
	import { groupName, groupSlug } from '@lyku/json-models';
	import { api } from '@lyku/monolith-ts-api';
	import { Button } from '../Button';
	let { visible = $bindable(false) } = $props();
	let name = $state('');
	let slug = $state('');
	let isPrivate = $state(false);
	const nameReg = new RegExp(groupName.pattern);
	const slugReg = new RegExp(groupSlug.pattern);
	let nameValid = $state();
	let slugValid = $state();
	const formValid = $derived(nameValid && slugValid);
	$effect(() => console.log('reg', name, slug, nameValid, slugValid));
	let submissionError = $state();
	let loading = $state(false);

	const submit = async () => {
		loading = true;
		const res = await api
			.createGroup({
				name,
				slug,
				private: isPrivate,
			})
			.catch((err) => {
				console.log('createGroup error', err);
				submissionError = err.toString();
			});
		if (res) {
			window.location = '/g/' + slug;
		}
		loading = false;
	};
</script>

<Dialog title="Create a group" bind:visible size="m">
	<Texticle
		bind:value={name}
		empty="Group name"
		invalid="Invalid name"
		valid="Greate name!"
		onvalidation={(v) => (nameValid = v)}
		schema={groupName}
	/>
	<Texticle
		bind:value={slug}
		empty="Group slug"
		invalid="Invalid slug"
		valid="Nice slug!"
		onvalidation={(v) => (slugValid = v)}
		schema={groupSlug}
	/>
	<Checkbox bind:checked={isPrivate} label="Private" />
	{#if loading}<Spinner />{:else}<Button disabled={!formValid} onClick={submit}
			>Create!</Button
		>{/if}
</Dialog>
<Dialog title="Group creation failed!" visible={submissionError} size="s">
	<Button onClick={() => (submissionError = undefined)}>Dismiss</Button>
</Dialog>
