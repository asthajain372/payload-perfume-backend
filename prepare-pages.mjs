// Bundles the SSR Worker into dist/client/_worker.js for Cloudflare Pages Advanced mode.
// Cloudflare Pages automatically uses _worker.js as the Worker that handles all requests.
import { execSync } from 'child_process';
import { existsSync, statSync, rmSync } from 'fs';

if (!existsSync('dist/server/index.js')) {
  console.error('dist/server/index.js not found — run vite build first');
  process.exit(1);
}

const esbuildBin = existsSync('node_modules/.bin/esbuild')
  ? 'node_modules/.bin/esbuild'
  : 'npx esbuild';

console.log('Bundling SSR Worker for Cloudflare Pages...');
// --platform=node makes esbuild treat all node:* builtins as external (provided at runtime by nodejs_compat).
// --format=esm keeps output as ES modules as required by Cloudflare Workers.
execSync(
  `${esbuildBin} dist/server/index.js --bundle --format=esm --platform=node --outfile=dist/client/_worker.js --log-level=warning`,
  { stdio: 'inherit' }
);

const size = statSync('dist/client/_worker.js').size;
const kb = Math.round(size / 1024);
console.log(`✓ dist/client/_worker.js ready (${kb} kB)`);

if (size > 1_000_000) {
  console.warn(`⚠ Worker is ${kb} kB — Cloudflare free plan allows 1 MB. Consider upgrading if deployment fails.`);
}

// Remove generated wrangler configs so Cloudflare Pages falls back to reading
// our root wrangler.toml (which has pages_build_output_dir + nodejs_compat).
// Without these files, Pages won't be confused by the generated Workers config.
if (existsSync('.wrangler')) {
  rmSync('.wrangler', { recursive: true, force: true });
  console.log('✓ Removed .wrangler/');
}
if (existsSync('dist/server/wrangler.json')) {
  rmSync('dist/server/wrangler.json');
  console.log('✓ Removed dist/server/wrangler.json');
}
