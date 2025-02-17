import * as path from 'path';
import tsconfig from './tsconfig.base.json';
import { treeShake } from 'esbuild-plugin-tree-shake';

export const plugins = [
	{
		name: 'path-resolver',
		setup(build: any) {
			build.onResolve({ filter: /^@lyku\// }, (args: { path: string }) => {
				const paths = tsconfig.compilerOptions.paths;
				// console.log(paths);
				const matchedPath = Object.entries(paths).find(([alias]) =>
					args.path.startsWith(alias.replace('/*', ''))
				);
				if (matchedPath) {
					const [alias, [mapping]] = matchedPath as [string, string[]];
					const resolvedPath = args.path.replace(
						alias.replace('/*', ''),
						mapping.replace('/*', '')
					);
					// console.log('Resolved path:', resolvedPath);
					// Use absolute path to dist directory
					const absolutePath = path.resolve(process.cwd(), resolvedPath);
					// console.log('Absolute path:', absolutePath);
					return { path: absolutePath };
				}
				return undefined;
			});
		},
	},
	treeShake(),
];
