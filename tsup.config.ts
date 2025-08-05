import { defineConfig } from 'tsup';

export default defineConfig([
    // Main bundle
    {
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        clean: true,
        sourcemap: true,
        external: ['react', 'react-dom', 'dompurify'],
    },
    // React bundle
    {
        entry: ['src/react/index.ts'],
        outDir: 'dist/react',
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['react', 'react-dom', 'dompurify'],
    },
    // Tailwind plugin bundle
    {
        entry: ['src/tailwind/index.ts'],
        outDir: 'dist/tailwind',
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['tailwindcss'],
    },
    // Standalone IIFE bundle for browsers (CDN usage)
    {
        entry: ['src/standalone.ts'],
        outDir: 'dist',
        outExtension: () => ({ js: '.browser.js' }), // Different filename
        format: ['iife'],
        globalName: 'ChangerawrMarkdown',
        minify: false,
        sourcemap: false,
        external: [], // Bundle everything for browser
        esbuildOptions: (options) => {
            options.platform = 'browser';
            options.target = 'es2015';
        },
    },
    // Standalone module versions (for npm usage)
    {
        entry: ['src/standalone.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['dompurify'],
    },
]);