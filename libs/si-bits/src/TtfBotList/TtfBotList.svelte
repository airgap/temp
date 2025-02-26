<script lang="ts">
  import { api } from 'monolith-ts-api';
  import { ttfFlowMode } from '@lyku/json-models';
  import { Button } from '../Button';
  import { phrasebook } from '../phrasebook';

  const { onclose } = $props<{ onclose: () => void }>();

  const modeLabels = {
    novice: phrasebook.vsNoviceAi,
    easy: phrasebook.vsEasyAi,
    medium: phrasebook.vsMediumAi,
    hard: phrasebook.vsHardAi,
  };

  function handleModeClick(mode: typeof ttfFlowMode.enum[number]) {
    api.newAiTtfMatch(mode).then(({ id }) => {
      window.location.hash = id.toString();
    });
  }
</script>

<Button onclick={onclose}>&lt; Back</Button>
{#each ttfFlowMode.enum as mode}
  <Button onclick={() => handleModeClick(mode)}>
    {modeLabels[mode]}
  </Button>
{/each} 