import { processReactionSync } from '.';
import * as http from 'http';

// Call the process function at a regular interval
setInterval(async () => {
	try {
		await processReactionSync();
		console.log('Reaction processing completed successfully');
	} catch (error) {
		console.error('Error in reaction processing:', error);
	}
}, 60000); // Run every minute

// Simple HTTP server for manual triggering
const server = http.createServer(async (req, res) => {
	if (req.url === '/process' && req.method === 'GET') {
		try {
			await processReactionSync();
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ success: true }));
		} catch (error) {
			console.error('Error processing reactions:', error);
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ success: false, error: String(error) }));
		}
	} else {
		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'Not found' }));
	}
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Reaction processing service running on port ${PORT}`);
	console.log(`Trigger manual processing: GET /process`);
});
