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

function findAllImports(filePath: string): string[] {
	const content = fs.readFileSync(filePath, 'utf8');
	const imports = new Set<string>();

	// Match various import patterns
	const patterns = [
		/from\s+['"]([^'"]+)['"]/g, // from 'package'
		/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // import('package')
		/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // require('package')
	];

	patterns.forEach((pattern) => {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			let importPath = match[1];

			// Extract package name for scoped packages and regular packages
			if (importPath.startsWith('@')) {
				// @scope/package or @scope/package/subpath
				const parts = importPath.split('/');
				if (parts.length >= 2) {
					imports.add(`${parts[0]}/${parts[1]}`);
				}
			} else if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
				// Regular package (not relative import)
				const packageName = importPath.split('/')[0];
				imports.add(packageName);
			}
		}
	});

	return Array.from(imports);
}

function getPackageJsonDeps(packageJsonPath: string): {
	devDeps: string[];
	deps: string[];
} {
	if (!fs.existsSync(packageJsonPath)) {
		return { devDeps: [], deps: [] };
	}

	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	return {
		devDeps: Object.keys(packageJson.devDependencies || {}),
		deps: Object.keys(packageJson.dependencies || {}),
	};
}

interface RouteAnalysis {
	routeName: string;
	imports: string[];
	devDependencies: string[];
	dependencies: string[];
	missingDependencies: string[];
	unusedDependencies: string[];
	hasPackageJson: boolean;
}

function analyzeRoute(routeDir: string): RouteAnalysis {
	const routeName = path.basename(routeDir);
	const packageJsonPath = path.join(routeDir, 'package.json');

	// Find all TypeScript files in the route
	const tsFiles = glob.sync('**/*.ts', { cwd: routeDir });

	const allImports = new Set<string>();
	const lykuImports = new Set<string>();

	// Scan all TS files for imports
	tsFiles.forEach((file) => {
		const filePath = path.join(routeDir, file);
		const imports = findAllImports(filePath);
		imports.forEach((imp) => {
			allImports.add(imp);
			if (imp.startsWith('@lyku/')) {
				lykuImports.add(imp);
			}
		});
	});

	const { devDeps, deps } = getPackageJsonDeps(packageJsonPath);
	const allDeclaredDeps = [...devDeps, ...deps];

	const missingDeps = Array.from(lykuImports).filter(
		(imp) => !devDeps.includes(imp),
	);

	// Find unused dependencies (declared but not imported)
	const unusedDeps = allDeclaredDeps.filter((dep) => !allImports.has(dep));

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
		devDependencies: devDeps,
		dependencies: deps,
		missingDependencies: hasMisplacedDeps ? ['MISPLACED_DEPS'] : missingDeps,
		unusedDependencies: unusedDeps,
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

function removeUnusedDeps(routeDir: string, unusedDeps: string[]): boolean {
	const packageJsonPath = path.join(routeDir, 'package.json');

	if (!fs.existsSync(packageJsonPath)) {
		console.log(`⚠️ No package.json found for ${path.basename(routeDir)}`);
		return false;
	}

	try {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		let removedCount = 0;

		// Remove from devDependencies
		unusedDeps.forEach((dep) => {
			if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
				delete packageJson.devDependencies[dep];
				removedCount++;
			}
			if (packageJson.dependencies && packageJson.dependencies[dep]) {
				delete packageJson.dependencies[dep];
				removedCount++;
			}
		});

		// Clean up empty objects
		if (
			packageJson.devDependencies &&
			Object.keys(packageJson.devDependencies).length === 0
		) {
			delete packageJson.devDependencies;
		}
		if (
			packageJson.dependencies &&
			Object.keys(packageJson.dependencies).length === 0
		) {
			delete packageJson.dependencies;
		}

		fs.writeFileSync(
			packageJsonPath,
			JSON.stringify(packageJson, null, 2) + '\n',
		);

		if (removedCount > 0) {
			console.log(`  🗑️  Removed ${removedCount} unused dependencies`);
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
	const checkUnused = args.includes('--unused');
	const cleanUnused = args.includes('--clean-unused');

	const routeDirs = fs
		.readdirSync(ROUTES_DIR, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('_'))
		.map((dirent) => path.join(ROUTES_DIR, dirent.name));

	const results = routeDirs.map(analyzeRoute);

	if (checkUnused || cleanUnused) {
		// Show unused dependencies analysis
		const routesWithUnused = results.filter(
			(result) => result.unusedDependencies.length > 0,
		);

		console.log('=== Unused Dependencies Analysis ===\n');

		if (routesWithUnused.length === 0) {
			console.log('✅ No unused dependencies found!');
			return;
		}

		console.log(
			`❌ Found ${routesWithUnused.length} routes with unused dependencies:\n`,
		);

		if (cleanUnused) {
			console.log('🧹 Cleaning unused dependencies...\n');

			let cleanedCount = 0;
			routesWithUnused.forEach((route) => {
				if (route.unusedDependencies.length > 0) {
					const routeDir = path.join(ROUTES_DIR, route.routeName);
					const success = removeUnusedDeps(routeDir, route.unusedDependencies);

					if (success) {
						console.log(
							`✅ Cleaned ${route.routeName} (removed ${route.unusedDependencies.length} deps)`,
						);
						cleanedCount++;
					} else {
						console.log(`❌ Failed to clean ${route.routeName}`);
					}
				}
			});

			console.log(
				`\n🎉 Cleaned ${cleanedCount} out of ${routesWithUnused.length} routes`,
			);
		} else {
			routesWithUnused.forEach((route) => {
				console.log(`📁 ${route.routeName}`);
				console.log(
					`   All imports: ${route.imports.length > 0 ? route.imports.slice(0, 10).join(', ') : 'none'}${route.imports.length > 10 ? '...' : ''}`,
				);
				console.log(
					`   Dependencies: ${route.dependencies.join(', ') || 'none'}`,
				);
				console.log(
					`   DevDependencies: ${route.devDependencies.slice(0, 10).join(', ') || 'none'}${route.devDependencies.length > 10 ? '...' : ''}`,
				);
				console.log(`   🗑️  Unused: ${route.unusedDependencies.join(', ')}`);
				console.log('');
			});

			const totalUnused = routesWithUnused.reduce(
				(acc, route) => acc + route.unusedDependencies.length,
				0,
			);
			console.log(
				`📊 Summary: ${totalUnused} total unused dependencies across ${routesWithUnused.length} routes`,
			);
			console.log(
				'\n💡 Run with --clean-unused to automatically remove unused dependencies',
			);
		}

		return;
	}

	// Original missing dependencies analysis
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
				`   Imports: ${route.imports.length > 0 ? route.imports.slice(0, 10).join(', ') : 'none'}${route.imports.length > 10 ? '...' : ''}`,
			);
			console.log(
				`   Declared: ${route.devDependencies.filter((dep) => dep.startsWith('@lyku/')).length > 0 ? route.devDependencies.filter((dep) => dep.startsWith('@lyku/')).join(', ') : 'none'}`,
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
		console.log('💡 Run with --unused to check for unused dependencies');
		console.log('💡 Run with --clean-unused to remove unused dependencies');
	}
}

if (import.meta.main) {
	main();
}
