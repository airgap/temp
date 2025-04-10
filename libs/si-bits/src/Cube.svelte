<script lang="ts">
	import createREGL from 'regl';
	import { onMount } from 'svelte';
	let scale = $state(0);

	// Svelte 5: use $props to get component inputs with defaults
	let {
		cubeSize = 1,
		pipeDiameter = 0.16,
		jointScale = 1.0, // Scale factor for joint diameter relative to pipe diameter
		rotationSpeedX = 0.01,
		rotationSpeedY = 0.01,
		rotationSpeedZ = 0.01,
	} = $props();

	let canvasElem: HTMLCanvasElement;
	// internal state for rotation and dragging
	let angleX = 0,
		angleY = 0,
		angleZ = 0;
	let isDragging = false;
	let lastX = 0,
		lastY = 0;

	onMount(() => {
		// Initialize regl with the canvas element
		const regl = createREGL(canvasElem);

		// Define cube vertices (side length = cubeSize)
		const half = cubeSize / 2;
		const vertices = [
			[-half, -half, -half],
			[half, -half, -half],
			[half, half, -half],
			[-half, half, -half],
			[-half, -half, half],
			[half, -half, half],
			[half, half, half],
			[-half, half, half],
		];
		// Define the 12 edges by index pairs (each connects two vertices)
		const edges = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0], // bottom face perimeter
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 4], // top face perimeter
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7], // vertical connections between top and bottom
		];

		// Setup the regl draw call for edge triangles (uses dynamic attributes)
		const drawEdges = regl({
			depth: { enable: true }, // Enable depth testing for proper 3D rendering
			attributes: {
				position: regl.prop('positions'),
			},
			uniforms: {
				color: [1, 0.8, 0.8, 1],
			},
			vert: `
          precision mediump float;
          attribute vec2 position;
          void main() {
            gl_Position = vec4(position, 0.0, 1.0);
          }
        `,
			frag: `
          precision mediump float;
          uniform vec4 color;
          void main() {
            gl_FragColor = color;
          }
        `,
			count: regl.prop('count'),
		});

		// Setup the regl draw call for joint circles
		const drawJoints = regl({
			depth: { enable: true },
			attributes: {
				position: regl.prop('positions'),
			},
			uniforms: {
				color: [1, 0.8, 0.8, 1],
			},
			vert: `
          precision mediump float;
          attribute vec2 position;
          void main() {
            gl_Position = vec4(position, 0.0, 1.0);
          }
        `,
			frag: `
          precision mediump float;
          uniform vec4 color;
          void main() {
            gl_FragColor = color;
          }
        `,
			count: regl.prop('count'),
		});

		// Animation loop
		let frameHandle: number;
		const animate = () => {
			if (!isDragging) {
				// Auto-rotate: increment angles by the given speeds
				angleX += rotationSpeedX;
				angleY += rotationSpeedY;
				angleZ += rotationSpeedZ;
			}

			// Precompute sines/cosines for current angles
			const cx = Math.cos(angleX),
				sx = Math.sin(angleX);
			const cy = Math.cos(angleY),
				sy = Math.sin(angleY);
			const cz = Math.cos(angleZ),
				sz = Math.sin(angleZ);

			// Camera parameters
			const fov = Math.PI / 4; // 45° field of view
			const aspect = canvasElem.width / canvasElem.height;
			const f = 1.0 / Math.tan(fov / 2.0); // perspective scale factor
			const cameraDist = cubeSize * 3; // distance of camera from cube center
			const halfW = canvasElem.width / 2;
			const halfH = canvasElem.height / 2;

			// Rotate and project all cube vertices to NDC
			const projected = vertices.map(([x, y, z]) => {
				// Apply rotation around X, Y, Z (in that order)
				let x1 = x;
				let y1 = cx * y - sx * z;
				let z1 = sx * y + cx * z;
				let x2 = cy * x1 + sy * z1;
				let y2 = y1;
				let z2 = -sy * x1 + cy * z1;
				let x3 = cz * x2 - sz * y2;
				let y3 = sz * x2 + cz * y2;
				let z3 = z2;
				// Translate cube relative to camera (camera looking toward origin from +Z)
				let zCamera = z3 - cameraDist;
				// Project to 2D (perspective divide)
				const d = -zCamera; // positive distance
				const ndcX = (x3 * f) / aspect / d;
				const ndcY = (y3 * f) / d;
				const depth = zCamera / (cameraDist * 2.0); // normalized depth (for completeness)
				return { ndcX, ndcY, d };
			});

			// Build an array of triangle vertices for all thick edges
			const edgePositions: [number, number][] = [];
			const jointPositions: [number, number][] = [];

			// First draw the joints
			for (const [x, y, z] of vertices) {
				// Apply rotation and projection to get screen coordinates
				let x1 = x;
				let y1 = cx * y - sx * z;
				let z1 = sx * y + cx * z;
				let x2 = cy * x1 + sy * z1;
				let y2 = y1;
				let z2 = -sy * x1 + cy * z1;
				let x3 = cz * x2 - sz * y2;
				let y3 = sz * x2 + cz * y2;
				let z3 = z2;

				let zCamera = z3 - cameraDist;
				const d = -zCamera;
				const ndcX = (x3 * f) / aspect / d;
				const ndcY = (y3 * f) / d;

				// Convert to pixel coordinates
				const px = ndcX * halfW + halfW;
				const py = ndcY * halfH + halfH;

				// Calculate joint size based on depth
				const jointSize = (pipeDiameter * jointScale * f * halfH) / d;

				// Create a circle of triangles for the joint
				const segments = 16;
				for (let i = 0; i < segments; i++) {
					const angle1 = (i * 2 * Math.PI) / segments;
					const angle2 = ((i + 1) * 2 * Math.PI) / segments;

					const x1 = px + Math.cos(angle1) * jointSize;
					const y1 = py + Math.sin(angle1) * jointSize;
					const x2 = px + Math.cos(angle2) * jointSize;
					const y2 = py + Math.sin(angle2) * jointSize;

					// Convert back to NDC
					jointPositions.push(
						[px / halfW - 1, py / halfH - 1],
						[x1 / halfW - 1, y1 / halfH - 1],
						[x2 / halfW - 1, y2 / halfH - 1],
					);
				}
			}

			// Then draw the edges
			for (const [i, j] of edges) {
				const A = projected[i];
				const B = projected[j];
				// Convert A and B from NDC to pixel coordinates (relative to canvas)
				const Ax = A.ndcX * halfW + halfW;
				const Ay = A.ndcY * halfH + halfH;
				const Bx = B.ndcX * halfW + halfW;
				const By = B.ndcY * halfH + halfH;
				// Compute the screen-space perpendicular vector for edge AB
				const dx = Bx - Ax;
				const dy = By - Ay;
				const length = Math.hypot(dx, dy);
				if (length === 0) continue;
				// Determine edge thickness in pixels based on average depth
				const avgDist = (A.d + B.d) / 2;
				const thicknessPixels = (pipeDiameter * f * halfH) / avgDist;
				const halfThick = thicknessPixels / 2;
				// Normalized perpendicular (dx, dy rotated 90 degrees)
				const px = -dy / length;
				const py = dx / length;
				// Offset the two endpoints in perpendicular directions
				const Ax_off1 = Ax + px * halfThick,
					Ay_off1 = Ay + py * halfThick;
				const Ax_off2 = Ax - px * halfThick,
					Ay_off2 = Ay - py * halfThick;
				const Bx_off1 = Bx + px * halfThick,
					By_off1 = By + py * halfThick;
				const Bx_off2 = Bx - px * halfThick,
					By_off2 = By - py * halfThick;
				// Convert back to NDC coordinates for WebGL
				edgePositions.push(
					[Ax_off1 / halfW - 1, Ay_off1 / halfH - 1],
					[Bx_off1 / halfW - 1, By_off1 / halfH - 1],
					[Ax_off2 / halfW - 1, Ay_off2 / halfH - 1],
					[Ax_off2 / halfW - 1, Ay_off2 / halfH - 1],
					[Bx_off1 / halfW - 1, By_off1 / halfH - 1],
					[Bx_off2 / halfW - 1, By_off2 / halfH - 1],
				);
			}

			// Draw all edges and joints
			// drawEdges({ positions: edgePositions, count: edgePositions.length });
			drawJoints({ positions: jointPositions, count: jointPositions.length });
			frameHandle = requestAnimationFrame(animate);
		};

		frameHandle = requestAnimationFrame(animate); // start the loop

		scale = 1;
		// Cleanup on component destroy (stop animation and release WebGL)
		return () => {
			cancelAnimationFrame(frameHandle);
			regl.destroy();
		};
	});

	// Pointer event handlers for interactive rotation
	function pointerDown(event: PointerEvent) {
		isDragging = true;
		lastX = event.clientX;
		lastY = event.clientY;
		canvasElem.setPointerCapture(event.pointerId);
	}
	function pointerMove(event: PointerEvent) {
		if (!isDragging) return;
		const dx = event.clientX - lastX;
		const dy = event.clientY - lastY;
		// Adjust angles based on drag delta (simple ratio factor)
		angleY += dx * 0.005;
		angleX += dy * 0.005;
		lastX = event.clientX;
		lastY = event.clientY;
	}
	function pointerUp() {
		isDragging = false;
	}
</script>

<!-- Canvas for WebGL output; pointer events enable dragging -->
<canvas
	bind:this={canvasElem}
	width={160}
	height={160}
	style={`touch-action: none; transition: .25s transform; transform: scale(${scale})`}
	on:pointerdown={pointerDown}
	on:pointermove={pointerMove}
	on:pointerup={pointerUp}
	on:pointercancel={pointerUp}
>
</canvas>
