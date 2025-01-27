import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const ROUTES_DIR = path.join(__dirname, '../apps/routes');

// Basic ingress template
const ingressTemplate = {
	apiVersion: 'networking.k8s.io/v1',
	kind: 'Ingress',
	metadata: {
		name: 'api-ingress',
		annotations: {
			'nginx.ingress.kubernetes.io/rewrite-target': '/$2',
			'nginx.ingress.kubernetes.io/use-regex': 'true',
			'nginx.ingress.kubernetes.io/proxy-body-size': '50m',
			'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
			'cert-manager.io/issuer': 'letsencrypt-nginx',
		},
	},
	spec: {
		ingressClassName: 'nginx',
		tls: [
			{
				hosts: ['api.lyku.org'],
				secretName: 'letsencrypt-nginx-cert',
				// secretName: 'cloudflare-origin-cert',
			},
		],
		rules: [
			{
				host: 'api.lyku.org',
				http: {
					paths: [],
				},
			},
		],
	},
};

// Get all directories in routes folder, excluding _shared
const routeDirs = fs
	.readdirSync(ROUTES_DIR, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory() && dirent.name !== '_shared')
	.map((dirent) => dirent.name);

// Generate path for each route
routeDirs.forEach((route) => {
	ingressTemplate.spec.rules[0].http.paths.push({
		path: `/${route}(/|$)(.*)`,
		pathType: 'ImplementationSpecific',
		backend: {
			service: {
				name: `${route}-service`,
				port: {
					number: 3000,
				},
			},
		},
	});
});

// Sort paths alphabetically for consistency
ingressTemplate.spec.rules[0].http.paths.sort((a, b) =>
	a.path.localeCompare(b.path),
);

// Write to k8s/base/ingress.yaml
const outputPath = path.join(__dirname, '../tmp/ingress.yaml');
fs.writeFileSync(outputPath, yaml.stringify(ingressTemplate));

console.log('Generated ingress configuration at:', outputPath);
console.log(`Created routes for ${routeDirs.length} endpoints`);
