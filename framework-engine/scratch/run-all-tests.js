import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(path.join(__dirname, '../..'));

function getTestFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Ignora node_modules e .git
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(getTestFiles(fullPath));
      }
    } else if (file.endsWith('.test.ts')) {
      results.push(path.relative(projectRoot, fullPath));
    }
  }
  return results;
}

const testFiles = getTestFiles(path.join(projectRoot, 'framework-engine/src'));
console.log(`Encontrados ${testFiles.length} arquivos de teste.`);
console.log(testFiles);

const stream = run({
  files: testFiles
});

stream.on('test:fail', (data) => {
  console.error(`\nFAIL: ${data.name}`);
  console.error(data.details?.error ?? data.details);
});

stream.compose(new spec()).pipe(process.stdout);
