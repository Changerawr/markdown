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
    // Standalone bundle (IIFE for CDN usage - bundles everything)
    {
        entry: ['src/standalone.ts'],
        format: ['iife'],
        outDir: 'dist',
        outExtension: () => ({ js: '.js' }),
        dts: false,
        sourcemap: false,
        minify: true,
        // Bundle everything - don't externalize anything for CDN
        external: [],
        noExternal: ['dompurify'], // Include DOMPurify in the bundle
        esbuildOptions: (options) => {
            options.define = {
                'process.env.NODE_ENV': '"production"',
            };
            // Platform browser ensures browser-compatible code
            options.platform = 'browser';
            options.globalName = 'ChangerawrMarkdownLib';
            // Add a wrapper to handle the global assignment
            options.footer = {
                js: `
// Global assignment for CDN usage
if (typeof window !== 'undefined') {
    window.ChangerawrMarkdown = ChangerawrMarkdownLib.default || ChangerawrMarkdownLib;
}
if (typeof globalThis !== 'undefined') {
    globalThis.ChangerawrMarkdown = ChangerawrMarkdownLib.default || ChangerawrMarkdownLib;
}
                `.trim()
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