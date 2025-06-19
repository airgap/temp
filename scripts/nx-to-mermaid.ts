#!/usr/bin/env tsx

import { execSync } from 'child_process';

interface ProjectGraphNode {
	name: string;
	type: string;
	data: {
		root: string;
		projectType?: string;
	};
}

interface ProjectGraphDependency {
	source: string;
	target: string;
	type: string;
}

interface NxGraphData {
	graph: {
		nodes: Record<string, ProjectGraphNode>;
		dependencies: Record<string, ProjectGraphDependency[]>;
	};
}

async function generateMermaidFromNxGraph(): Promise<string> {
	// Generate NX graph JSON
	console.log('Generating NX graph...');
	execSync('nx graph --file=nx-graph.json --print=false', { stdio: 'inherit' });
	const json = await Bun.file('nx-graph.json').json();
	// Read the generated JSON
	const graphData: NxGraphData = json;

	let mermaid = 'graph TD\n';

	// Helper to sanitize node names for Mermaid
	const sanitizeNodeName = (name: string): string => {
		return name.replace(/[^a-zA-Z0-9_]/g, '_');
	};

	// Add nodes with styling based on type
	Object.entries(graphData.graph.nodes).forEach(([name, node]) => {
		const nodeType = node.data.projectType || node.type;
		const style = nodeType === 'application' ? ':::appStyle' : ':::libStyle';
		const sanitizedName = sanitizeNodeName(name);
		mermaid += `  ${sanitizedName}["${name}"]${style}\n`;
	});

	// Add dependencies
	Object.entries(graphData.graph.dependencies).forEach(([source, deps]) => {
		deps.forEach((dep) => {
			const sanitizedSource = sanitizeNodeName(source);
			const sanitizedTarget = sanitizeNodeName(dep.target);
			mermaid += `  ${sanitizedSource} --> ${sanitizedTarget}\n`;
		});
	});

	// Add styling
	mermaid += '\n';
	mermaid +=
		'classDef appStyle fill:#ff6b6b,stroke:#d63447,stroke-width:2px,color:#fff\n';
	mermaid +=
		'classDef libStyle fill:#4ecdc4,stroke:#26d0ce,stroke-width:2px,color:#fff\n';

	return mermaid;
}

if (require.main === module) {
	try {
		const mermaidDiagram = await generateMermaidFromNxGraph();
		Bun.write('dependency-graph.mmd', mermaidDiagram);
		console.log('Mermaid diagram generated: dependency-graph.mmd');
	} catch (error) {
		console.error('Error generating Mermaid diagram:', error);
		process.exit(1);
	}
}
