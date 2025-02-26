<script lang="ts">
    import { api } from 'monolith-ts-api';
    import * as schemas from '@lyku/json-models';
    import type { Channel } from '@lyku/json-models';
    import { Button } from '../Button';
    import { ChannelList } from '../ChannelList';
    import { Texticle } from '../Texticle';
    import { phrasebook } from '../phrasebook';

    let channels: Channel[] = [];
    let channelCreatorShown = false;
    let channelNameValid = false;
    let channelName = '';

    // Fetch channels on component mount
    api.listMyChannels()
        .then((result) => {
            if (result) channels = result;
        })
        .catch(console.error);

    async function handleCreateChannel() {
        try {
            await api.createChannel({ name: channelName });
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }
</script>

<ChannelList channels={channels} mine={true}>
    {#if channelCreatorShown}
        <div>
            <Button onclick={() => channelCreatorShown = false}>
                Never Mind
            </Button>
            <Texticle
                empty={phrasebook.channelNameEmpty}
                valid={phrasebook.channelNameValid}
                invalid={phrasebook.channelNameInvalid}
                oninput={(e) => channelName = e.detail}
                onvalidation={(e) => channelNameValid = e.detail}
                schema={schemas.channelName}
            />
            <Button onclick={handleCreateChannel} disabled={!channelNameValid}>
                {phrasebook.letsGo}
            </Button>
        </div>
    {:else}
        <Button onclick={() => channelCreatorShown = true}>
            {phrasebook.createChannel}
        </Button>
    {/if}
</ChannelList> 