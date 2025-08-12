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

	function getStoredVolume(): number | null {
		const stored = localStorage.getItem('flimGameVolume');
		if (stored !== null) {
			const parsed = parseInt(stored);
			if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
				return parsed;
			}
		}
		return null;
	}

	function setStoredVolume(value: number): void {
		localStorage.setItem('flimGameVolume', value.toString());
	}

	let volumeLevel = $state(100);
	let isMuted = $state(false);
	let isFullscreen = $state(false);
	let gameWrapper: HTMLDivElement;

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

	function toggleMute() {
		isMuted = !isMuted;
		if (phaserRef.game && phaserRef.game.sound) {
			phaserRef.game.sound.mute = isMuted;
		}
	}

	function setVolume(value: number) {
		volumeLevel = value;
		if (phaserRef.game && phaserRef.game.sound) {
			phaserRef.game.sound.volume = value / 100;
		}
		setStoredVolume(value);
	}

	function toggleFullscreen() {
		if (!gameWrapper) return;

		if (!document.fullscreenElement) {
			gameWrapper
				.requestFullscreen()
				.then(() => {
					isFullscreen = true;
				})
				.catch((err) => {
					console.error('Error entering fullscreen:', err);
				});
		} else {
			document
				.exitFullscreen()
				.then(() => {
					isFullscreen = false;
				})
				.catch((err) => {
					console.error('Error exiting fullscreen:', err);
				});
		}
	}

	onMount(() => {
		const savedVolume = getStoredVolume();
		if (savedVolume !== null) {
			volumeLevel = savedVolume;
		}

		phaserRef.game = StartGame('game-container');

		if (phaserRef.game && phaserRef.game.sound) {
			phaserRef.game.sound.volume = volumeLevel / 100;
		}

		EventBus.on('current-scene-ready', (scene_instance: Scene) => {
			phaserRef.scene = scene_instance;

			if (currentActiveScene) {
				currentActiveScene(scene_instance);
			}
		});

		document.addEventListener('fullscreenchange', () => {
			isFullscreen = !!document.fullscreenElement;
		});

		return () => {
			document.removeEventListener('fullscreenchange', () => {
				isFullscreen = !!document.fullscreenElement;
			});
		};
	});
</script>

<div class="game-wrapper" bind:this={gameWrapper}>
	<div id="game-container"></div>
	<div class="game-controls">
		<div class="game-title">Grabba Byte by LYKU</div>
		<div class="controls-group">
			<button
				class="control-btn"
				onclick={toggleMute}
				aria-label={isMuted ? 'Unmute' : 'Mute'}
			>
				{#if isMuted}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M11 5L6 9H2v6h4l5 4V5z" />
						<line x1="23" y1="9" x2="17" y2="15" />
						<line x1="17" y1="9" x2="23" y2="15" />
					</svg>
				{:else}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
						<path
							d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
						/>
					</svg>
				{/if}
			</button>

			<div class="volume-control">
				<input
					type="range"
					min="0"
					max="100"
					value={volumeLevel}
					oninput={(e) => setVolume(Number(e.currentTarget.value))}
					aria-label="Volume"
					disabled={isMuted}
				/>
			</div>

			<button
				class="control-btn"
				onclick={toggleFullscreen}
				aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
			>
				{#if isFullscreen}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
						/>
					</svg>
				{:else}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</div>

<style lang="sass">
	.game-wrapper
		width: min(600px, calc((100vh - 163px) * 0.75))
		margin: 0 0
		border: 1px solid #ffffff55
		border-radius: 10px
		overflow: hidden
		box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.5)
		display: flex
		flex-direction: column

	#game-container
		aspect-ratio: 3 / 4
		text-align: center
		width: 100%
		position: relative
		font-size: 0

	.game-controls
		display: flex
		align-items: center
		justify-content: space-between
		padding: 8px 12px
		background: rgba(0, 0, 0, 0.5)
		border-top: 1px solid #ffffff33
		height: 48px
		flex-shrink: 0

	.game-title
		color: white
		font-family: 'Silkscreen', monospace
		font-size: 19px
		white-space: nowrap

	.controls-group
		display: flex
		align-items: center
		gap: 12px

	.control-btn
		background: transparent
		border: none
		border-radius: 4px
		color: white
		cursor: pointer
		padding: 6px
		display: flex
		align-items: center
		justify-content: center
		transition: all 0.2s

		&:hover
			background: rgba(255, 255, 255, 0.1)
			border-color: #ffffff88

		&:active
			transform: scale(0.95)

	.volume-control
		display: flex
		align-items: center
		gap: 8px

		input[type="range"]
			width: 80px
			height: 4px
			-webkit-appearance: none
			appearance: none
			background: #ffffff33
			border-radius: 2px
			outline: none
			cursor: pointer

			&::-webkit-slider-thumb
				-webkit-appearance: none
				appearance: none
				width: 12px
				height: 12px
				background: white
				border-radius: 50%
				cursor: pointer

			&::-moz-range-thumb
				width: 12px
				height: 12px
				background: white
				border-radius: 50%
				cursor: pointer

			&:disabled
				opacity: 0.5
				cursor: not-allowed

</style>
