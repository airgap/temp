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
		},
	},
	spec: {
		rules: [
			{
				http: {
					paths: [],
				},
			},
		],
	},
};

// Get all directories in routes folder
const routeDirs = fs
	.readdirSync(ROUTES_DIR, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	.map((dirent) => dirent.name);

// Generate path for each route
routeDirs.forEach((route) => {
	ingressTemplate.spec.rules[0].http.paths.push({
		path: `/api/${route}(/|$)(.*)`,
		pathType: 'Prefix',
		backend: {
			service: {
				name: `${route}-service`,
				port: {
					number: 80,
				},
			},
		},
	});
});

// Write to k8s/base/ingress.yaml
const outputPath = path.join(__dirname, '../k8s/base/ingress.yaml');
fs.writeFileSync(outputPath, yaml.stringify(ingressTemplate));

console.log('Generated ingress configuration at:', outputPath);
