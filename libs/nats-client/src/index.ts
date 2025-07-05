import * as nats from 'nats';

export const natsConnectionString = 'nats://nats.nats:4222'; //process.env['NATS_CONNECTION_STRING'] || 'nats://localhost:4222';

console.log('Connecting to NATS', natsConnectionString);
export const client = await nats.connect({
	servers: [natsConnectionString],
});
console.log('Connected to NATS');
