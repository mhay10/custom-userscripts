import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the metadata block
const metaPath = join(__dirname, 'meta.js');
const metaContent = readFileSync(metaPath, 'utf-8');

// Build configuration
const buildOptions = {
  entryPoints: [join(__dirname, 'src/index.ts')],
  bundle: true,
  minify: false,
  sourcemap: false,
  format: 'iife',
  target: 'es2020',
  write: false, // We'll handle writing manually to prepend metadata
};

async function build() {
  try {
    // Bundle the TypeScript code
    await esbuild.build({
      ...buildOptions,
      banner: {
        js: metaContent.trim(),
      },
      outfile: join(__dirname, 'dist', 'googledocs-remove-gemini-bar.user.js'),
      write: true,
    });

    console.log('Build completed successfully!');
    console.log(`Output: dist/googledocs-remove-gemini-bar.user.js`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Handle watch mode
if (process.argv.includes('--watch')) {
  esbuild
    .context({
      ...buildOptions,
      banner: {
        js: metaContent.trim(),
      },
      outfile: join(__dirname, 'dist', 'googledocs-remove-gemini-bar.user.js'),
    })
    .then((ctx) => {
      console.log('Watching for changes...');
      ctx.watch();
    })
    .catch(() => process.exit(1));
} else {
  build();
}
