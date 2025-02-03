import { Tree, generateFiles, names } from '@nx/devkit';
import * as path from 'path';

export default async function (tree: Tree, schema: any) {
	const routeName = names(schema.name);
	generateFiles(
		tree,
		path.join(__dirname, 'files'),
		`libs/routes/${routeName.fileName}`,
		{
			...routeName,
			template: '',
		}
	);
}
