<script>
  import {ChunkViz} from '@lyku/si-bits';

  let mockUpload = $state(null);
  let mockFile = $state(null);
  let currentProgress = $state(0);
  let isUploading = $state(false);
  let incrementSize = $state(0.1); // Small increment for testing

  // Simple browser-compatible EventEmitter
  class SimpleEventEmitter {
    constructor() {
      this.events = {};
    }

    on(event, handler) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(handler);
    }

    off(event, handler) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(h => h !== handler);
    }

    emit(event, data) {
      if (!this.events[event]) return;
      this.events[event].forEach(handler => handler(data));
    }
  }

  // Create a mock upload object with EventEmitter
  function createMockUpload() {
    const emitter = new SimpleEventEmitter();
    return {
      on: (event, handler) => emitter.on(event, handler),
      off: (event, handler) => emitter.off(event, handler),
      emit: (event, data) => emitter.emit(event, data),
      emitter
    };
  }

  // Create a mock file object
  function createMockFile() {
    return {
      name: 'test-video.mp4',
      size: 52428800 // 50MB
    };
  }

  // Simulate upload with configurable increments
  function startSimulatedUpload() {
    if (isUploading) return;

    // Reset and create new upload
    currentProgress = 0;
    mockUpload = createMockUpload();
    mockFile = createMockFile();
    isUploading = true;

    const interval = setInterval(() => {
      if (currentProgress >= 100) {
        clearInterval(interval);
        isUploading = false;
        return;
      }

      currentProgress = Math.min(100, currentProgress + incrementSize);
      mockUpload.emit('progress', { detail: currentProgress });
    }, 50); // Update every 50ms
  }

  // Test specific scenarios
  function testSmallIncrements() {
    incrementSize = 0.1;
    startSimulatedUpload();
  }

  function testNormalIncrements() {
    incrementSize = 2;
    startSimulatedUpload();
  }

  function testLargeIncrements() {
    incrementSize = 10;
    startSimulatedUpload();
  }

  function testSingleIncrement(size) {
    if (!mockUpload) {
      mockUpload = createMockUpload();
      mockFile = createMockFile();
    }
    currentProgress = Math.min(100, currentProgress + size);
    mockUpload.emit('progress', { detail: currentProgress });
  }

  function reset() {
    currentProgress = 0;
    isUploading = false;
    mockUpload = createMockUpload();
    mockFile = createMockFile();
  }

  // Initialize on mount
  $effect(() => {
    mockUpload = createMockUpload();
    mockFile = createMockFile();
  });
</script>

<div class="test-container">
  <h1>ChunkViz Component Test</h1>

  <div class="visualization-section">
    {#if mockUpload && mockFile}
      <ChunkViz file={mockFile} upload={mockUpload} />
    {/if}
  </div>

  <div class="controls">
    <h2>Test Controls</h2>

    <div class="control-group">
      <h3>Automated Tests</h3>
      <button onclick={testSmallIncrements} disabled={isUploading}>
        Test Small Increments (0.1%)
      </button>
      <button onclick={testNormalIncrements} disabled={isUploading}>
        Test Normal Increments (2%)
      </button>
      <button onclick={testLargeIncrements} disabled={isUploading}>
        Test Large Increments (10%)
      </button>
    </div>

    <div class="control-group">
      <h3>Manual Progress Control</h3>
      <div class="manual-controls">
        <button onclick={() => testSingleIncrement(0.1)}>+0.1%</button>
        <button onclick={() => testSingleIncrement(0.5)}>+0.5%</button>
        <button onclick={() => testSingleIncrement(1)}>+1%</button>
        <button onclick={() => testSingleIncrement(5)}>+5%</button>
        <button onclick={() => testSingleIncrement(10)}>+10%</button>
      </div>
    </div>

    <div class="control-group">
      <h3>Settings</h3>
      <label>
        Increment Size:
        <input
          type="number"
          bind:value={incrementSize}
          min="0.1"
          max="50"
          step="0.1"
          disabled={isUploading}
        />%
      </label>
    </div>

    <div class="status">
      <p>Current Progress: <strong>{currentProgress.toFixed(1)}%</strong></p>
      <p>Status: <strong>{isUploading ? 'Uploading...' : 'Idle'}</strong></p>
    </div>

    <button onclick={reset} class="reset-btn">Reset</button>
  </div>
</div>

<style>
  .test-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  h1 {
    text-align: center;
    color: #1e293b;
    margin-bottom: 2rem;
  }

  .visualization-section {
    display: flex;
    justify-content: center;
    margin-bottom: 3rem;
  }

  .controls {
    background: #f1f5f9;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #334155;
    margin-bottom: 1.5rem;
  }

  .control-group {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .control-group:last-of-type {
    border-bottom: none;
  }

  h3 {
    color: #475569;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    transition: all 0.2s;
  }

  button:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  button:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .manual-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .manual-controls button {
    background: #10b981;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .manual-controls button:hover {
    background: #059669;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #475569;
    font-weight: 500;
  }

  input[type="number"] {
    padding: 0.5rem;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    width: 100px;
    font-size: 1rem;
  }

  input[type="number"]:disabled {
    background: #e2e8f0;
    cursor: not-allowed;
  }

  .status {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1.5rem;
    border: 1px solid #e2e8f0;
  }

  .status p {
    margin: 0.5rem 0;
    color: #475569;
  }

  .status strong {
    color: #1e293b;
  }

  .reset-btn {
    background: #ef4444;
    margin-top: 1rem;
    width: 100%;
  }

  .reset-btn:hover {
    background: #dc2626;
  }
</style>
