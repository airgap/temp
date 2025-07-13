<script context="module" lang="ts">
	import type { Game, Scene } from 'phaser';

	export type TPhaserRef = {
		game: Game | null;
		scene: Scene | null;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import StartGame from './game/main';
	import { EventBus } from './game/EventBus';
	const {
		phaserRef = {
			game: null,
			scene: null,
		},
		currentActiveScene,
	} = $props<{
		phaserRef?: TPhaserRef;
		currentActiveScene?: (scene: Scene) => void | undefined;
	}>();
	onMount(() => {
		phaserRef.game = StartGame('game-container');

		EventBus.on('current-scene-ready', (scene_instance: Scene) => {
			phaserRef.scene = scene_instance;

			if (currentActiveScene) {
				currentActiveScene(scene_instance);
			}
		});
	});
</script>

<div id="game-container"></div>

<style lang="sass">
	#game-container
		height: calc(100vh - 75px)
		text-align: center
</style>
