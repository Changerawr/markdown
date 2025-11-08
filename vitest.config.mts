import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        testTimeout: 300000, // 5 minutes for performance tests
        hookTimeout: 300000, // 5 minutes for hooks
        teardownTimeout: 300000, // 5 minutes for teardown
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: false,
            },
        },
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.test.{ts,tsx}',
                'examples/',
                'tests/',
            ],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});