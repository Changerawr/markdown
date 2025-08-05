import { defineConfig } from 'tsup';

export default defineConfig([
    // Main bundle
    {
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        clean: true,
        sourcemap: true,
        external: ['react', 'react-dom'],
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
        external: ['react', 'react-dom'],
        esbuildOptions: (options) => {
            options.banner = {
                js: '"use client";',
            };
        },
    },
    // Standalone bundle (no React dependency)
    {
        entry: ['src/standalone.ts'],
        format: ['cjs', 'esm', 'iife'],
        dts: true,
        sourcemap: true,
        globalName: 'ChangerawrMarkdown',
        minify: true,
        esbuildOptions: (options) => {
            options.define = {
                'process.env.NODE_ENV': '"production"',
            };
        },
    },
]);