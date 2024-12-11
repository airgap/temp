import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

function removeSvgNamespaces(svgContent: string): string {
  return svgContent
    .replace(/\s+xmlns[^=]*="[^"]*"/g, '')
    .replace(/\s+xmlns[^=]*='[^']*'/g, '')
    .replace(/\s+serif[^=]*="[^"]*"/g, '')
    .replace(/\s+serif[^=]*='[^']*'/g, '');
}

async function optimizeSvgs() {
  try {
    // Get all SVG files in current directory and subdirectories, excluding node_modules
    const svgFiles = await glob('**/*.svg', {
      ignore: ['**/node_modules/**'],
      absolute: true,
    });

    for (const filePath of svgFiles) {
      // Read SVG file
      const content = await fs.promises.readFile(filePath, 'utf8');

      // Remove namespaces
      const optimized = removeSvgNamespaces(content);

      // Write back to same file
      await fs.promises.writeFile(filePath, optimized, 'utf8');

      console.log(`Optimized: ${path.relative(process.cwd(), filePath)}`);
    }

    console.log('SVG optimization complete!');
  } catch (error) {
    console.error('Error optimizing SVGs:', error);
  }
}

// Run the optimization
optimizeSvgs();
