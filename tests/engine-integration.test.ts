/**
 * Engine Integration tests for @changerawr/markdown
 * Tests the overall engine with different extension combinations
 */

import { describe, it, expect } from 'vitest';
import {
    createEngine,
    createMinimalEngine,
    createCoreOnlyEngine,
    createHTMLEngine,
    createTailwindEngine,
    createDebugEngine
} from '../src';
import { TextExtension, HeadingExtension } from '../src/extensions/core';

describe('Engine Integration', () => {
    describe('Default Engine', () => {
        it('should include all core and feature extensions', () => {
            const engine = createEngine();
            const extensions = engine.getExtensions();

            // Core extensions
            expect(extensions).toContain('text');
            expect(extensions).toContain('heading');
            expect(extensions).toContain('bold');
            expect(extensions).toContain('italic');

            // Feature extensions
            expect(extensions).toContain('alert');
            expect(extensions).toContain('button');
            expect(extensions).toContain('embed');
        });

        it('should render complex markdown correctly', () => {
            const engine = createEngine();
            const markdown = `
# Main Title

This is **bold** and *italic* text with \`inline code\`.

:::info
This is an alert box.
:::

[button:Click Me](https://example.com){primary}

[embed:github](https://github.com/user/repo)
`;

            const html = engine.toHtml(markdown);

            expect(html).toContain('<h1');
            expect(html).toContain('<strong');
            expect(html).toContain('<em');
            expect(html).toContain('<code');
            expect(html).toContain('bg-blue-500/10'); // alert
            expect(html).toContain('bg-blue-600'); // button
            expect(html).toContain('GitHub Repository'); // embed
        });
    });

    describe('Minimal Engine', () => {
        it('should work with no extensions', () => {
            const engine = createMinimalEngine([]);
            const extensions = engine.getExtensions();
            expect(extensions).toHaveLength(0);

            const html = engine.toHtml('# Test');
            expect(html).toBe('# Test'); // Treated as plain text
        });

        it('should work with selected extensions only', () => {
            const engine = createMinimalEngine([TextExtension, HeadingExtension]);
            const extensions = engine.getExtensions();

            expect(extensions).toContain('text');
            expect(extensions).toContain('heading');
            expect(extensions).not.toContain('bold');
            expect(extensions).not.toContain('alert');

            const html = engine.toHtml('# Test **bold**');
            expect(html).toContain('<h1'); // Heading works
            expect(html).toContain('**bold**'); // Bold doesn't work, treated as text
        });
    });

    describe('Core Only Engine', () => {
        it('should include core extensions but not features', () => {
            const engine = createCoreOnlyEngine();
            const extensions = engine.getExtensions();

            // Should have core extensions
            expect(extensions).toContain('text');
            expect(extensions).toContain('heading');
            expect(extensions).toContain('bold');

            // Should not have feature extensions
            expect(extensions).not.toContain('alert');
            expect(extensions).not.toContain('button');
            expect(extensions).not.toContain('embed');
        });

        it('should render core markdown but not features', () => {
            const engine = createCoreOnlyEngine();
            const markdown = `
# Heading
**Bold** text
:::info
Alert not supported
:::
`;

            const html = engine.toHtml(markdown);
            expect(html).toContain('<h1');
            expect(html).toContain('<strong');
            expect(html).toContain(':::info'); // Not parsed as alert
        });
    });

    describe('Format-Specific Engines', () => {
        it('should create HTML engine with correct format', () => {
            const engine = createHTMLEngine();
            const html = engine.toHtml('# Test');

            expect(html).toContain('<h1');
            expect(html).not.toContain('class='); // No CSS classes
            expect(html).not.toContain('text-3xl');
        });

        it('should create Tailwind engine with correct format', () => {
            const engine = createTailwindEngine();
            const html = engine.toHtml('# Test');

            expect(html).toContain('<h1');
            expect(html).toContain('class=');
            expect(html).toContain('text-3xl');
        });

        it('should create debug engine with warnings', () => {
            const engine = createDebugEngine();
            engine.toHtml('**unclosed bold');

            const warnings = engine.getWarnings();
            expect(warnings.length).toBeGreaterThan(0);
        });
    });

    describe('Extension Registration', () => {
        it('should allow registering custom extensions', () => {
            const engine = createEngine();

            const customExtension = {
                name: 'highlight',
                parseRules: [{
                    name: 'highlight',
                    pattern: /==(.+)==/g,
                    render: (match: RegExpMatchArray) => ({
                        type: 'highlight',
                        content: match[1] || '',
                        raw: match[0] || ''
                    })
                }],
                renderRules: [{
                    type: 'highlight',
                    render: (token: any) => `<mark>${token.content}</mark>`
                }]
            };

            const result = engine.registerExtension(customExtension);
            expect(result.success).toBe(true);
            expect(engine.hasExtension('highlight')).toBe(true);

            const html = engine.toHtml('This is ==highlighted==.');
            expect(html).toContain('<mark>highlighted</mark>');
        });

        it('should allow unregistering extensions', () => {
            const engine = createEngine();

            expect(engine.hasExtension('alert')).toBe(true);

            const success = engine.unregisterExtension('alert');
            expect(success).toBe(true);
            expect(engine.hasExtension('alert')).toBe(false);

            const html = engine.toHtml(':::info\nTest\n:::');
            expect(html).not.toContain('bg-blue-500/10');
        });
    });

    describe('Performance', () => {
        it('should handle large content efficiently', () => {
            const engine = createEngine();
            const largeContent = Array(100).fill('# Heading\n\nParagraph with **bold** text.\n').join('\n');

            const startTime = performance.now();
            const html = engine.toHtml(largeContent);
            const endTime = performance.now();

            expect(html).toContain('<h1');
            expect(html).toContain('<strong');
            expect(endTime - startTime).toBeLessThan(500); // Should be fast
        });
    });
});