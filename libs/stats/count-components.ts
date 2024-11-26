import { writeFileSync } from 'fs';
import { globSync } from 'glob';

const componentFiles = globSync('libs/ui-bits/src/**/*.tsx', {
  ignore: ['libs/ui-bits/src/**/*.spec.tsx']
});
writeFileSync('dist/libs/stats/components.json', componentFiles.length.toString());
