import { withNx } from '@nx/rollup/with-nx.js';
import url from '@rollup/plugin-url';
import svg from '@svgr/rollup';

export default withNx(
  {
    main: './src/index.ts',
    outputPath: '../../dist/libs/ui-bits',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    format: ['esm'],
    assets: [{ input: '.', output: '.', glob: 'README.md' }],
  },
  {
    plugins: [
      svg({
        svgo: false,
        titleProp: true,
        ref: true,
      }),
      url({
        limit: 10000,
        include: ['**/*.wav'],
      }),
    ],
  }
);
