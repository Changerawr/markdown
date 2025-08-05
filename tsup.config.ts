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
        esbuildOptions: (options) => {
            options.banner = {
                js: '"use client";',
            };
        },
    },
    // React bundle
    {
        entry: ['src/react/index.ts'],
        outDir: 'dist/react',
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['react', 'react-dom', 'dompurify'],
        esbuildOptions: (options) => {
            options.banner = {
                js: '"use client";',
            };
        },
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
    // Standalone bundle (no React dependency, for CDN usage)
    {
        entry: ['src/standalone.ts'],
        format: ['iife'],
        outDir: 'dist',
        outExtension: () => ({ js: '.js' }),
        dts: false,
        sourcemap: false,
        minify: true,
        // Don't set globalName - let the code handle it manually
        esbuildOptions: (options) => {
            options.define = {
                'process.env.NODE_ENV': '"production"',
            };
            // Ensure the IIFE executes properly
            options.footer = {
                js: '// Standalone build for CDN usage'
            };
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