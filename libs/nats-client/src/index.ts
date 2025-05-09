import * as nats from 'nats';

export const natsPort = process.env['NATS_PORT'] || 'nats://localhost:4222';

console.log('Connecting to NATS');
const nc = await nats.connect({
	servers: [natsPort],
});
console.log('Connected to NATS');
