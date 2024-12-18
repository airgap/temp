import { readFile, writeFile } from 'fs/promises';

const appFileContent = await readFile('apps/webui/src/App.tsx', 'utf-8');

const routeRegex = /<Route\s+match={\/(.*?)\/}>\s*<(\w+)\s*\/>\s*<\/Route>/g;
const routeMap: Record<string, string> = {};

let match;
while ((match = routeRegex.exec(appFileContent)) !== null) {
	const [, routeMatch, component] = match;
	routeMap[routeMatch] = component;
}

const jsonOutput = JSON.stringify(routeMap, null, 2);
await writeFile('dist/libs/stats/route-map.json', jsonOutput);

console.log('Route map extracted and saved to route-map.json');
