import { defineConfig } from 'tsup';
import { cpSync, existsSync } from 'fs';

async function copyTailwindCSS() {
    if (!existsSync('src/css')) return;
    try {
        cpSync('src/css', 'dist/css', { recursive: true });
        console.log('✅ Copied Tailwind CSS assets to dist/css');
    } catch (err) {
        console.error('❌ Failed to copy Tailwind CSS:', err);
    }
}

export default defineConfig([
    {
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        clean: true,
        sourcemap: true,
        external: ['react', 'react-dom', 'dompurify'],
        onSuccess: async () => {
            await copyTailwindCSS();
        },
    },
    {
        entry: ['src/react/index.ts'],
        outDir: 'dist/react',
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['react', 'react-dom', 'dompurify'],
    },
    {
        entry: ['src/tailwind/index.ts'],
        outDir: 'dist/tailwind',
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['tailwindcss'],
    },
    {
        entry: ['src/standalone.ts'],
        outDir: 'dist',
        outExtension: () => ({ js: '.browser.js' }),
        format: ['iife'],
        globalName: 'ChangerawrMarkdown',
        minify: false,
        sourcemap: false,
        external: [],
        esbuildOptions: (options) => {
            options.platform = 'browser';
            options.target = 'es2015';
        },
    },
    {
        entry: ['src/standalone.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['dompurify'],
    },
]);
