#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const ROUTES_DIR = 'apps/routes';
const LYKU_IMPORT_PATTERN = /from\s+['"]@lyku\/([^'"]+)['"]/g;

function findLykuImports(filePath: string): string[] {
	const content = fs.readFileSync(filePath, 'utf8');
	const imports = new Set<string>();
	let match;

	while ((match = LYKU_IMPORT_PATTERN.exec(content)) !== null) {
		imports.add(`@lyku/${match[1]}`);
	}

	return Array.from(imports);
}

function getPackageJsonDevDeps(packageJsonPath: string): string[] {
	if (!fs.existsSync(packageJsonPath)) {
		return [];
	}

	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	return Object.keys(packageJson.devDependencies || {});
}

interface RouteAnalysis {
	routeName: string;
	imports: string[];
	devDependencies: string[];
	missingDependencies: string[];
	hasPackageJson: boolean;
}

function analyzeRoute(routeDir: string): RouteAnalysis {
	const routeName = path.basename(routeDir);
	const packageJsonPath = path.join(routeDir, 'package.json');

	// Find all TypeScript files in the route
	const tsFiles = glob.sync('**/*.ts', { cwd: routeDir });

	const allImports = new Set<string>();

	// Scan all TS files for @lyku imports
	tsFiles.forEach((file) => {
		const filePath = path.join(routeDir, file);
		const imports = findLykuImports(filePath);
		imports.forEach((imp) => allImports.add(imp));
	});

	const devDeps = getPackageJsonDevDeps(packageJsonPath);
	const missingDeps = Array.from(allImports).filter(
		(imp) => !devDeps.includes(imp),
	);

	// Also check if there are @lyku/* deps in regular dependencies that need to be moved
	let hasMisplacedDeps = false;
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		if (packageJson.dependencies) {
			const lykuInDeps = Object.keys(packageJson.dependencies).filter((dep) =>
				dep.startsWith('@lyku/'),
			);
			hasMisplacedDeps = lykuInDeps.length > 0;
		}
	}

	return {
		routeName,
		imports: Array.from(allImports),
		devDependencies: devDeps.filter((dep) => dep.startsWith('@lyku/')),
		missingDependencies: hasMisplacedDeps ? ['MISPLACED_DEPS'] : missingDeps,
		hasPackageJson: fs.existsSync(packageJsonPath),
	};
}

function updatePackageJson(routeDir: string, missingDeps: string[]): boolean {
	const packageJsonPath = path.join(routeDir, 'package.json');

	if (!fs.existsSync(packageJsonPath)) {
		console.log(`⚠️ No package.json found for ${path.basename(routeDir)}`);
		return false;
	}

	try {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

		if (!packageJson.devDependencies) {
			packageJson.devDependencies = {};
		}

		// Move any @lyku/* packages from dependencies to devDependencies
		let movedCount = 0;
		if (packageJson.dependencies) {
			const lykuDeps = Object.keys(packageJson.dependencies).filter((dep) =>
				dep.startsWith('@lyku/'),
			);
			lykuDeps.forEach((dep) => {
				packageJson.devDependencies[dep] = packageJson.dependencies[dep];
				delete packageJson.dependencies[dep];
				movedCount++;
			});

			// Remove dependencies object if it's now empty
			if (Object.keys(packageJson.dependencies).length === 0) {
				delete packageJson.dependencies;
			}
		}

		// Re-scan for actual missing dependencies after moving misplaced ones
		const tsFiles = glob.sync('**/*.ts', { cwd: routeDir });
		const allImports = new Set<string>();

		tsFiles.forEach((file) => {
			const filePath = path.join(routeDir, file);
			const imports = findLykuImports(filePath);
			imports.forEach((imp) => allImports.add(imp));
		});

		const actualMissingDeps = Array.from(allImports).filter(
			(imp) => !packageJson.devDependencies[imp],
		);

		// Add missing dependencies to devDependencies
		actualMissingDeps.forEach((dep) => {
			packageJson.devDependencies[dep] = 'workspace:*';
		});

		fs.writeFileSync(
			packageJsonPath,
			JSON.stringify(packageJson, null, 2) + '\n',
		);

		if (movedCount > 0) {
			console.log(
				`  📦 Moved ${movedCount} @lyku/* packages from dependencies to devDependencies`,
			);
		}
		if (actualMissingDeps.length > 0) {
			console.log(
				`  ➕ Added ${actualMissingDeps.length} missing @lyku/* dependencies`,
			);
		}

		return true;
	} catch (error) {
		console.log(`❌ Failed to update ${packageJsonPath}: ${error}`);
		return false;
	}
}

function main() {
	const args = process.argv.slice(2);
	const shouldFix = args.includes('--fix');

	const routeDirs = fs
		.readdirSync(ROUTES_DIR, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('_'))
		.map((dirent) => path.join(ROUTES_DIR, dirent.name));

	const results = routeDirs.map(analyzeRoute);
	const problematicRoutes = results.filter(
		(result) => result.missingDependencies.length > 0,
	);

	console.log('=== Route Dependency Analysis ===\n');

	if (problematicRoutes.length === 0) {
		console.log(
			'✅ All routes have their @lyku/* dependencies properly declared!',
		);
		return;
	}

	console.log(
		`❌ Found ${problematicRoutes.length} routes with missing @lyku/* dependencies:\n`,
	);

	if (shouldFix) {
		console.log('🔧 Fixing package.json files...\n');

		let fixedCount = 0;
		problematicRoutes.forEach((route) => {
			if (route.missingDependencies.length > 0) {
				const routeDir = path.join(ROUTES_DIR, route.routeName);
				const success = updatePackageJson(routeDir, route.missingDependencies);

				if (success) {
					console.log(
						`✅ Fixed ${route.routeName} (added ${route.missingDependencies.length} deps)`,
					);
					fixedCount++;
				} else {
					console.log(`❌ Failed to fix ${route.routeName}`);
				}
			}
		});

		console.log(
			`\n🎉 Fixed ${fixedCount} out of ${problematicRoutes.length} routes`,
		);
	} else {
		// Show analysis without fixing
		problematicRoutes.forEach((route) => {
			console.log(`📁 ${route.routeName}`);
			console.log(
				`   Imports: ${route.imports.length > 0 ? route.imports.join(', ') : 'none'}`,
			);
			console.log(
				`   Declared: ${route.devDependencies.length > 0 ? route.devDependencies.join(', ') : 'none'}`,
			);
			console.log(`   Missing: ${route.missingDependencies.join(', ')}`);
			console.log(
				`   Package.json exists: ${route.hasPackageJson ? '✅' : '❌'}`,
			);
			console.log('');
		});

		// Summary
		const totalMissingDeps = problematicRoutes.reduce(
			(acc, route) => acc + route.missingDependencies.length,
			0,
		);
		console.log(
			`📊 Summary: ${totalMissingDeps} total missing dependencies across ${problematicRoutes.length} routes`,
		);

		console.log(
			'\n💡 Run with --fix to automatically update package.json files',
		);
	}
}

if (import.meta.main) {
	main();
}
