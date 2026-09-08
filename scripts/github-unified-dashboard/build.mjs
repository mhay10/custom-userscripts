import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const HEADER_FILE = join(__dirname, 'header.txt');
const ENTRY_POINT = join(__dirname, 'src', 'index.ts');
const OUTPUT_DIR = join(__dirname, 'dist');
const OUTPUT_FILE = join(OUTPUT_DIR, 'github-unified-dashboard.user.js');

// Read the metadata header
let header = '';
try {
  header = readFileSync(HEADER_FILE, 'utf-8');
  console.log('✓ Loaded metadata header from:', HEADER_FILE);
} catch (error) {
  console.error('✗ Failed to read header file:', error.message);
  process.exit(1);
}

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

// Build configuration
const buildConfig = {
  entryPoints: [ENTRY_POINT],
  bundle: true,
  minify: false, // Set to true for production
  sourcemap: false,
  target: ['es2020'],
  format: 'iife',
  outfile: join(OUTPUT_DIR, 'bundle.tmp.js'),
};

async function build() {
  try {
    console.log('🔨 Building with esbuild...');
    
    // Perform the build
    await esbuild.build({
      ...buildConfig,
      write: true,
    });
    
    console.log('✓ Bundle created successfully');
    
    // Read the bundled code
    const bundledCode = readFileSync(join(OUTPUT_DIR, 'bundle.tmp.js'), 'utf-8');
    
    // Combine header and bundled code
    const finalOutput = `${header}\n${bundledCode}`;
    
    // Write the final output
    writeFileSync(OUTPUT_FILE, finalOutput, 'utf-8');
    console.log('✓ Final userscript written to:', OUTPUT_FILE);
    
    // Clean up temporary file
    try {
      unlinkSync(join(OUTPUT_DIR, 'bundle.tmp.js'));
      console.log('✓ Cleaned up temporary files');
    } catch (e) {
      // Ignore cleanup errors
    }
    
    console.log('\n✅ Build completed successfully!');
    console.log(`   Output: ${OUTPUT_FILE}`);
    console.log(`   Size: ${(Buffer.byteLength(finalOutput, 'utf-8') / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('✗ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
build();
