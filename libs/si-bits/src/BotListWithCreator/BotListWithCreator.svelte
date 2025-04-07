<script lang="ts">
	import { api } from 'monolith-ts-api';
	import * as schemas from '@lyku/json-models';
	import { Button } from '../Button';
	import { Texticle } from '../Texticle';
	import { UserList } from '../UserList';
	import { phrasebook } from '../phrasebook';

	let botCreatorShown = $state(false);
	let botNameValid = $state(false);
	let botName = $state('');
	let bots = $state<any[]>([]);

	// Fetch bots on component mount
	api.listMyBots().then((result) => {
		bots = result;
	});

	async function handleCreateBot() {
		try {
			await api.createBot({ username: botName });
			window.location.reload();
		} catch (error) {
			alert(error);
		}
	}
</script>

<UserList users={bots} mine={true}>
	{#if botCreatorShown}
		<div>
			<Button onClick={() => (botCreatorShown = false)}>
				{phrasebook.neverMind}
			</Button>
			<Texticle
				empty={phrasebook.botNameEmpty}
				valid={phrasebook.botNameValid}
				invalid={phrasebook.botNameInvalid}
				oninput={(e) => (botName = e.detail)}
				onvalidation={(e) => (botNameValid = e.detail)}
				schema={schemas.username}
			/>
			<Button onClick={handleCreateBot} disabled={!botNameValid}>
				{phrasebook.letsGo}
			</Button>
		</div>
	{:else}
		<Button onClick={() => (botCreatorShown = true)}>
			{phrasebook.createBot}
		</Button>
	{/if}
</UserList>
