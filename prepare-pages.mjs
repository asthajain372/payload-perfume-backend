// Bundles the SSR Worker into dist/client/_worker.js for Cloudflare Pages Advanced mode.
// Cloudflare Pages automatically uses _worker.js as the Worker that handles all requests.
import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';

if (!existsSync('dist/server/index.js')) {
  console.error('dist/server/index.js not found — run vite build first');
  process.exit(1);
}

const esbuildBin = existsSync('node_modules/.bin/esbuild')
  ? 'node_modules/.bin/esbuild'
  : 'npx esbuild';

console.log('Bundling SSR Worker for Cloudflare Pages...');
// node:* and cloudflare:* are provided at runtime by the Workers nodejs_compat layer
execSync(
  `${esbuildBin} dist/server/index.js --bundle --format=esm --outfile=dist/client/_worker.js --log-level=warning --external:node:* --external:cloudflare:*`,
  { stdio: 'inherit' }
);

const size = statSync('dist/client/_worker.js').size;
const kb = Math.round(size / 1024);
console.log(`✓ dist/client/_worker.js ready (${kb} kB)`);

if (size > 1_000_000) {
  console.warn(`⚠ Worker is ${kb} kB — Cloudflare free plan allows 1 MB. Consider upgrading if deployment fails.`);
}
