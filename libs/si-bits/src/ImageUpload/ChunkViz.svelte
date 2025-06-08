<script>
	import { onMount, onDestroy } from 'svelte';
	import { hilbert } from './hilbert';
	import { boxfit } from './boxfit';

	const { file, upload } = $props();
	let container;
	let animationId;
	let progress = $state(0);
	let particles = $state([]);
	let particleId = 0;
	let imageData = null;
	let imageWidth = 0;
	let imageHeight = 0;
	let imageUrl = null;
	let containerWidth = 100;
	let containerHeight = 100;
	let l = 16;
	let w = l,
		h = l;
	let c = l * l;
	const particleSize = $derived(containerWidth / w);

	// Fluid simulation parameters
	const PARTICLE_SIZE = containerWidth / w;
	const GRAVITY = -0.3;
	const DAMPING = 0.98;
	const PARTICLE_COUNT_MULTIPLIER = 1; // reduced for better performance
	const MAX_PARTICLES = 10000; // limit total particles

	class FluidParticle {
		constructor(x, y, color, d) {
			this.id = particleId++;
			this.x = x;
			this.y = y;
			this.vx = (Math.random() - 0.5) * 2;
			this.vy = Math.random() * 2 + 1; // upward velocity
			this.life = 100000.0;
			this.decay = 0.00008 + Math.random() * 0.00012;
			this.size = d; // + Math.random() * 2;
			this.color =
				color ||
				`rgb(${59 + Math.random() * 100}, ${130 + Math.random() * 100}, ${246})`;
			this.sourceX = x;
			this.sourceY = y;
		}

		update(containerHeight) {
			// Apply physics
			this.vy += GRAVITY;
			this.x += this.vx;
			this.y += this.vy;

			// Apply damping
			this.vx *= DAMPING;
			this.vy *= DAMPING;

			// Decay over time
			// this.life -= this.decay;

			// Boundary collision (sides)
			if (this.x <= this.size || this.x >= containerWidth - this.size) {
				this.vx *= -0.8;
				this.x = Math.max(
					this.size,
					Math.min(containerWidth - this.size, this.x),
				);
			}

			// Return true if particle should be removed
			return this.life <= 0; // || this.y < -50;
		}
	}

	function getPixelColor(x, y) {
		if (!imageData || !imageWidth || !imageHeight) return null;

		// Map particle position to image coordinates
		const imgX = Math.floor((x / containerWidth) * imageWidth);
		const imgY = Math.floor((y / containerHeight) * imageHeight);

		// Clamp to image bounds
		const clampedX = Math.max(0, Math.min(imageWidth - 1, imgX));
		const clampedY = Math.max(0, Math.min(imageHeight - 1, imgY));

		// Get pixel data
		const index = (clampedY * imageWidth + clampedX) * 4;
		const r = imageData[index];
		const g = imageData[index + 1];
		const b = imageData[index + 2];

		return `rgb(${r}, ${g}, ${b})`;
	}

	function releaseFluid(amount) {
		// Remove oldest particles if we're at the limit
		// const particlesToAdd = Math.max(1, Math.floor(amount * PARTICLE_COUNT_MULTIPLIER));
		// const currentCount = particles.length;

		// if (currentCount + particlesToAdd > MAX_PARTICLES) {
		//   particles = particles.slice(particlesToAdd);
		// }
		const currentCount = particles.length;
		const expected = ((progress + amount) / 100) * w * h;
		const particlesToAdd = expected - currentCount;
		if (particlesToAdd && particles.at(-1))
			particles.at(-1).size = containerWidth / w;
		for (let i = 0; i < particlesToAdd; i++) {
			// Release particles from bottom area with some randomness
			// const x = 5 + (Math.random() * (containerWidth - 10));
			// const y = 5 +  (Math.random() * (containerHeight-10));
			const coords = hilbert(w, currentCount + i);
			console.log('prog', progress, 'coords', coords);
			const x = (coords.x / w) * containerWidth;
			const y = (coords.y / h) * containerHeight;
			const color = getPixelColor(x, y);
			particles = [
				...particles,
				new FluidParticle(x, y, color, containerWidth / w),
			];
		}
		// const subprog = (expected - ~~expected) * containerHeight / w;
		// console.log('subprog', subprog);
		// if(particles.at(-1))particles.at(-1).size = subprog
	}

	function animate() {
		if (!container) return;

		// Update particles and their positions in DOM
		particles = particles.filter((particle) => {
			const shouldRemove = particle.update(containerHeight);
			return !shouldRemove;
		});

		// Force Svelte to update the DOM
		particles = particles;

		animationId = requestAnimationFrame(animate);
	}

	function handleProgress(event) {
		const newProgress = event.detail;
		const delta = newProgress - progress;

		if (delta > 0) {
			releaseFluid(delta);
		}

		progress = newProgress;
	}

	async function loadImageData() {
		if (!file) return;

		// Clean up previous imageUrl
		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
			imageUrl = null;
		}

		if (file.type.startsWith('image/')) {
			// Load image
			const img = new Image();
			const url = URL.createObjectURL(file);
			imageUrl = url;

			await new Promise((resolve) => {
				img.onload = resolve;
				img.src = url;
			});

			// Extract pixel data
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			// Scale down for performance
			const maxSize = 100;
			const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
			canvas.width = imageWidth = Math.floor(img.width * scale);
			canvas.height = imageHeight = Math.floor(img.height * scale);

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
		} else if (file.type.startsWith('video/')) {
			// Extract frame from video
			const video = document.createElement('video');
			const url = URL.createObjectURL(file);

			await new Promise((resolve) => {
				video.onloadeddata = resolve;
				video.src = url;
			});

			video.currentTime = 0.1; // Get frame at 0.1 seconds

			await new Promise((resolve) => {
				video.onseeked = resolve;
			});

			// Extract pixel data from video frame
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			// Scale down for performance
			const maxSize = 100;
			const scale = Math.min(
				maxSize / video.videoWidth,
				maxSize / video.videoHeight,
				1,
			);
			canvas.width = imageWidth = Math.floor(video.videoWidth * scale);
			canvas.height = imageHeight = Math.floor(video.videoHeight * scale);

			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

			// Create image URL from extracted frame
			canvas.toBlob((blob) => {
				if (blob) {
					imageUrl = URL.createObjectURL(blob);
				}
			});

			URL.revokeObjectURL(url);
		}
	}

	onMount(() => {
		// Get container dimensions
		if (container) {
			const rect = container.getBoundingClientRect();
			containerWidth = rect.width;
			containerHeight = rect.height;
		}

		animate();
		loadImageData();

		// Listen for upload progress
		if (upload) {
			upload.on('progress', handleProgress);
		}

		// Handle resize
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
				containerHeight = entry.contentRect.height;
			}
		});

		if (container) {
			resizeObserver.observe(container);
		}

		return () => {
			resizeObserver.disconnect();
		};
	});

	onDestroy(() => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}

		if (upload) {
			upload.off('progress', handleProgress);
		}

		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
		}
	});

	// Effect to handle upload changes
	$effect(() => {
		if (upload) {
			// Clean up previous listener
			upload.off('progress', handleProgress);
			// Add new listener
			upload.on('progress', handleProgress);
			// Reset state
			progress = 0;
			particles = [];
		}
	});

	// Effect to reload image data when file changes
	$effect(() => {
		if (file) {
			loadImageData();
		}
	});
</script>

<div class="upload-visualizer">
	<div class="upload-container" bind:this={container}>
		<div class="upload-info">
			{#if file}
				<div class="file-name">
					{file.name.length > 12 ? file.name.slice(0, 10) + '...' : file.name}
				</div>
				<div class="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
			{/if}

			<div class="progress-text">{Math.round(progress)}%</div>

			<!-- <div class="particle-count">
          {particles.length} particles active
        </div> -->
		</div>
		<div class="particle-container">
			{#each particles as particle (particle.id)}
				<div
					class="particle"
					style="
            left: {particle.x}px;
            top: {particle.y}px;
            width: {particle.size}px;
            height: {particle.size}px;
            opacity: {particle.life};
            {imageUrl
						? `
              background-image: url('${imageUrl}');
              background-size: ${containerWidth}px ${containerHeight}px;
              background-position: -${particle.sourceX - particle.size / 2}px -${particle.sourceY - particle.size / 2}px;
              background-repeat: no-repeat;
            `
						: `background-color: ${particle.color};`}
          "
				></div>
			{/each}
		</div>

		<!-- <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div> -->
	</div>
</div>

<style>
	.upload-visualizer {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		align-items: center;
		width: 100%;
		height: 100%;
		/* background: linear-gradient(135deg, #1e293b, #0f172a); */
		border-radius: 12px;
		/* box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); */
	}

	.upload-container {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 8px;
		/* overflow: hidden; */
		background: #0f172a;
		/* border: 2px solid #334155; */
	}

	.particle-container {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.particle {
		position: absolute;
		/* border-radius: 50%; */
		will-change: transform, opacity, left, top;
		pointer-events: none;
		transition: none;
		animation: wobble 2s infinite;
	}
	@keyframes wobble {
		0% {
			transform: scale(0.7);
		}
		50% {
			transform: scale(1);
		}
		100% {
			transform: scale(0.7);
		}
	}

	.upload-info {
		position: absolute;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		color: white;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		pointer-events: none;
		z-index: 10;
	}

	.file-name {
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: #e2e8f0;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.file-size {
		font-size: 0.8rem;
		color: #94a3b8;
		margin-bottom: 0.5rem;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.progress-text {
		font-size: 1.1rem;
		font-weight: 700;
		color: #3b82f6;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
		margin-bottom: 0.25rem;
	}

	.particle-count {
		font-size: 0.7rem;
		color: #64748b;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.progress-bar {
		position: absolute;
		bottom: 10px;
		left: 20px;
		right: 20px;
		height: 4px;
		background: rgba(59, 130, 246, 0.3);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #3b82f6;
		transition: width 0.3s ease-out;
	}
</style>
