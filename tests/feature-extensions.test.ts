// tests/feature-extensions.test.ts
/**
 * Feature Extensions tests for @changerawr/markdown
 * Tests alert, button, and embed extensions based on actual implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChangerawrMarkdown } from '../src/engine';

describe('Feature Extensions', () => {
    let engine: ChangerawrMarkdown;

    beforeEach(() => {
        engine = new ChangerawrMarkdown();
    });

    describe('AlertExtension', () => {
        it('should parse alert tokens correctly', () => {
            const markdown = ':::info Test Title\nTest content\n:::';
            const tokens = engine.parse(markdown);

            const alertToken = tokens.find(t => t.type === 'alert');
            expect(alertToken).toBeDefined();
            expect(alertToken?.content).toBe('Test content');
            expect(alertToken?.attributes?.type).toBe('info');
            expect(alertToken?.attributes?.title).toBe('Test Title');
        });

        it('should render info alerts', () => {
            const markdown = ':::info Important Information\nThis is some important info.\n:::';
            const html = engine.toHtml(markdown);

            expect(html).toContain('Important Information');
            expect(html).toContain('This is some important info');
            expect(html).toContain('role="alert"');
            expect(html).toContain('aria-live="polite"');
        });

        it('should render alerts without custom titles', () => {
            const markdown = ':::warning\nSimple warning message.\n:::';
            const html = engine.toHtml(markdown);

            expect(html).toContain('Warning');
            expect(html).toContain('Simple warning message');
        });

        it('should render different alert types', () => {
            const types = ['info', 'warning', 'error', 'success', 'tip', 'note'];

            types.forEach(type => {
                const markdown = `:::${type}\nTest message\n:::`;
                const html = engine.toHtml(markdown);
                expect(html).toContain('Test message');
            });
        });

        it('should render nested markdown inside alerts', () => {
            const markdown = `:::info Alert with Formatting
This has **bold** and *italic* text.
Also a [link](https://example.com) and \`code\`.
:::`;
            const html = engine.toHtml(markdown);

            // Should render markdown elements
            expect(html).toContain('<strong');
            expect(html).toContain('bold</strong>');
            expect(html).toContain('<em');
            expect(html).toContain('italic</em>');
            expect(html).toContain('<a');
            expect(html).toContain('href="https://example.com"');
            expect(html).toContain('<code');

            // Should not have raw markdown syntax
            expect(html).not.toContain('**bold**');
            expect(html).not.toContain('*italic*');
        });
    });

    describe('ButtonExtension', () => {
        it('should parse button syntax correctly', () => {
            const markdown = '[button:Click Me](https://example.com){primary}';
            const tokens = engine.parse(markdown);

            const buttonToken = tokens.find(t => t.type === 'button');
            expect(buttonToken).toBeDefined();
            expect(buttonToken?.content).toBe('Click Me');
            expect(buttonToken?.attributes?.href).toBe('https://example.com');
            expect(buttonToken?.attributes?.style).toBe('primary');
        });

        it('should render button with all base classes', () => {
            const markdown = '[button:Test Button](https://example.com){primary}';
            const html = engine.toHtml(markdown);

            // Check for basic button structure
            expect(html).toContain('<a');
            expect(html).toContain('href="https://example.com"');
            expect(html).toContain('Test Button');

            // Check for some key base classes
            expect(html).toContain('inline-flex');
            expect(html).toContain('items-center');
            expect(html).toContain('justify-center');
            expect(html).toContain('font-medium');
            expect(html).toContain('rounded-lg');
        });

        it('should render different button styles correctly', () => {
            // Test primary style
            const primaryMarkdown = '[button:Primary](https://example.com){primary}';
            const primaryHtml = engine.toHtml(primaryMarkdown);
            expect(primaryHtml).toContain('bg-blue-600');
            expect(primaryHtml).toContain('text-white');

            // Test success style
            const successMarkdown = '[button:Success](https://example.com){success}';
            const successHtml = engine.toHtml(successMarkdown);
            expect(successHtml).toContain('bg-green-600');

            // Test outline style
            const outlineMarkdown = '[button:Outline](https://example.com){outline}';
            const outlineHtml = engine.toHtml(outlineMarkdown);
            expect(outlineHtml).toContain('border');
            expect(outlineHtml).toContain('border-blue-600');
            expect(outlineHtml).toContain('text-blue-600');

            // Test ghost style
            const ghostMarkdown = '[button:Ghost](https://example.com){ghost}';
            const ghostHtml = engine.toHtml(ghostMarkdown);
            expect(ghostHtml).toContain('text-gray-700');
            expect(ghostHtml).toContain('hover:bg-gray-100');
        });

        it('should render different button sizes correctly', () => {
            // Test small size
            const smallMarkdown = '[button:Small](https://example.com){primary,sm}';
            const smallHtml = engine.toHtml(smallMarkdown);
            expect(smallHtml).toContain('px-3');
            expect(smallHtml).toContain('py-1.5');
            expect(smallHtml).toContain('text-sm');

            // Test medium size (default)
            const mediumMarkdown = '[button:Medium](https://example.com){primary,md}';
            const mediumHtml = engine.toHtml(mediumMarkdown);
            expect(mediumHtml).toContain('px-4');
            expect(mediumHtml).toContain('py-2');
            expect(mediumHtml).toContain('text-base');

            // Test large size
            const largeMarkdown = '[button:Large](https://example.com){primary,lg}';
            const largeHtml = engine.toHtml(largeMarkdown);
            expect(largeHtml).toContain('px-6');
            expect(largeHtml).toContain('py-3');
            expect(largeHtml).toContain('text-lg');
        });

        it('should handle target attributes correctly', () => {
            // Default target should be _blank
            const defaultMarkdown = '[button:Default](https://example.com){primary}';
            const defaultHtml = engine.toHtml(defaultMarkdown);
            expect(defaultHtml).toContain('target="_blank"');
            expect(defaultHtml).toContain('rel="noopener noreferrer"');

            // Self target
            const selfMarkdown = '[button:Self](https://example.com){primary,self}';
            const selfHtml = engine.toHtml(selfMarkdown);
            expect(selfHtml).toContain('target="_self"');
            expect(selfHtml).not.toContain('rel="noopener noreferrer"');
        });

        it('should handle disabled buttons correctly', () => {
            const markdown = '[button:Disabled](https://example.com){primary,disabled}';
            const html = engine.toHtml(markdown);

            expect(html).toContain('aria-disabled="true"');
            expect(html).toContain('tabindex="-1"');
            // Should not have external link icon when disabled
            expect(html).not.toContain('<svg');
        });

        it('should add external link icons for _blank targets', () => {
            const markdown = '[button:External](https://example.com){primary}';
            const html = engine.toHtml(markdown);

            expect(html).toContain('<svg');
            expect(html).toContain('w-4 h-4 ml-1');
            expect(html).toContain('viewBox="0 0 24 24"');
        });

        it('should parse multiple options correctly', () => {
            const markdown = '[button:Multi Options](https://test.com){success,lg,disabled,self}';
            const tokens = engine.parse(markdown);

            const buttonToken = tokens.find(t => t.type === 'button');
            expect(buttonToken?.content).toBe('Multi Options');
            expect(buttonToken?.attributes?.href).toBe('https://test.com');
            expect(buttonToken?.attributes?.style).toBe('success');
            expect(buttonToken?.attributes?.size).toBe('lg');
            expect(buttonToken?.attributes?.disabled).toBe('true');
            expect(buttonToken?.attributes?.target).toBe('_self');
        });

        it('should work with success, sm, self example', () => {
            const markdown = '[button:Click Me](https://example.com){success,sm,self}';
            const html = engine.toHtml(markdown);

            // Should be green (success)
            expect(html).toContain('bg-green-600');
            // Should be small
            expect(html).toContain('px-3');
            expect(html).toContain('py-1.5');
            expect(html).toContain('text-sm');
            // Should open in same tab
            expect(html).toContain('target="_self"');
            // Should not have external icon
            expect(html).not.toContain('<svg');
        });
    });

    describe('EmbedExtension', () => {
        it('should parse embed syntax correctly', () => {
            const markdown = '[embed:youtube](https://youtube.com/watch?v=test){autoplay:1}';
            const tokens = engine.parse(markdown);

            const embedToken = tokens.find(t => t.type === 'embed');
            expect(embedToken).toBeDefined();
            expect(embedToken?.content).toBe('https://youtube.com/watch?v=test');
            expect(embedToken?.attributes?.provider).toBe('youtube');
            expect(embedToken?.attributes?.url).toBe('https://youtube.com/watch?v=test');
            expect(embedToken?.attributes?.options).toBe('autoplay:1');
        });

        it('should render embed container classes', () => {
            const markdown = '[embed:generic](https://example.com)';
            const html = engine.toHtml(markdown);

            expect(html).toContain('rounded-lg');
            expect(html).toContain('border');
            expect(html).toContain('bg-card');
        });

        it('should handle YouTube embeds', () => {
            const markdown = '[embed:youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ){autoplay:1}';
            const html = engine.toHtml(markdown);

            expect(html).toContain('youtube.com/embed/dQw4w9WgXcQ');
            expect(html).toContain('autoplay=1');
            expect(html).toContain('<iframe');
            expect(html).toContain('allowfullscreen');
        });

        it('should handle invalid YouTube URLs', () => {
            const markdown = '[embed:youtube](invalid-url)';
            const html = engine.toHtml(markdown);

            expect(html).toContain('Invalid YouTube URL');
            expect(html).toContain('invalid-url');
        });

        it('should handle GitHub embeds', () => {
            const markdown = '[embed:github](https://github.com/user/repo)';
            const html = engine.toHtml(markdown);

            expect(html).toContain('user/repo');
            expect(html).toContain('GitHub Repository');
            expect(html).toContain('View on GitHub');
            expect(html).toContain('target="_blank"');
        });

        it('should handle generic embeds', () => {
            const markdown = '[embed:generic](https://example.com/content)';
            const html = engine.toHtml(markdown);

            expect(html).toContain('External Link');
            expect(html).toContain('example.com');
            expect(html).toContain('https://example.com/content');
        });
    });

    describe('Extension Integration', () => {
        it('should register extensions correctly', () => {
            expect(engine.hasExtension('alert')).toBe(true);
            expect(engine.hasExtension('button')).toBe(true);
            expect(engine.hasExtension('embed')).toBe(true);

            const extensions = engine.getExtensions();
            expect(extensions).toContain('alert');
            expect(extensions).toContain('button');
            expect(extensions).toContain('embed');
        });

        it('should handle mixed extension content', () => {
            const markdown = `# Test Page

This page demonstrates extensions.

:::info
This is an alert box.
:::

[button:Learn More](https://example.com){primary}

[embed:github](https://github.com/user/repo)
`;

            const html = engine.toHtml(markdown);

            // Should contain elements from all extensions
            expect(html).toContain('<h1'); // heading (core extension)
            expect(html).toContain('alert box'); // alert content
            expect(html).toContain('Learn More'); // button content
            expect(html).toContain('GitHub Repository'); // embed content
        });

        it('should allow unregistering extensions', () => {
            const success = engine.unregisterExtension('alert');
            expect(success).toBe(true);
            expect(engine.hasExtension('alert')).toBe(false);

            // Should not render alerts anymore
            const html = engine.toHtml(':::info\nTest\n:::');
            expect(html).toContain(':::info'); // Should be treated as text
        });
    });
});