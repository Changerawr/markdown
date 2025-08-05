/**
 * Extension tests for @changerawr/markdown
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ChangerawrMarkdown } from '../src/engine';

describe('Extensions', () => {
    let engine: ChangerawrMarkdown;

    // Helper to load test content
    const loadTestContent = (filename: string): string => {
        return readFileSync(join(__dirname, 'content/extensions', filename), 'utf-8');
    };

    beforeEach(() => {
        engine = new ChangerawrMarkdown();
    });

    describe('AlertExtension', () => {
        it('should parse and render all alert types', () => {
            const markdown = loadTestContent('alerts.md');
            const html = engine.toHtml(markdown);

            // Check for all alert types
            expect(html).toContain('bg-blue-500/10'); // info
            expect(html).toContain('bg-amber-500/10'); // warning
            expect(html).toContain('bg-red-500/10'); // error
            expect(html).toContain('bg-green-500/10'); // success
            expect(html).toContain('bg-purple-500/10'); // tip
            expect(html).toContain('bg-gray-500/10'); // note

            // Check for content
            expect(html).toContain('Important Information');
            expect(html).toContain('Be Careful');
            expect(html).toContain('Database Error');
            expect(html).toContain('Task Complete');
            expect(html).toContain('Pro Tip');
            expect(html).toContain('General Note');

            // Check for accessibility
            expect(html).toContain('role="alert"');
            expect(html).toContain('aria-live="polite"');

            // Check for icons
            expect(html).toContain('ℹ️'); // info icon
            expect(html).toContain('⚠️'); // warning icon
            expect(html).toContain('❌'); // error icon
            expect(html).toContain('✅'); // success icon
            expect(html).toContain('💡'); // tip icon
            expect(html).toContain('📝'); // note icon
        });

        it('should handle alerts without custom titles', () => {
            const markdown = ':::warning\nSimple warning message.\n:::';
            const html = engine.toHtml(markdown);

            expect(html).toContain('Warning'); // Default title
            expect(html).toContain('Simple warning message');
            expect(html).toContain('⚠️');
        });

        it('should parse alert tokens correctly', () => {
            const markdown = ':::info Test Title\nTest content\n:::';
            const tokens = engine.parse(markdown);

            const alertToken = tokens.find(t => t.type === 'alert');
            expect(alertToken?.content).toBe('Test content');
            expect(alertToken?.attributes?.type).toBe('info');
            expect(alertToken?.attributes?.title).toBe('Test Title');
        });
    });

    describe('ButtonExtension', () => {
        it('should parse and render all button variants', () => {
            const markdown = loadTestContent('buttons.md');
            const html = engine.toHtml(markdown);

            // Debug: Log the actual HTML to see what's being generated
            console.log('Generated HTML:', html);

            // Check for button elements
            expect(html).toContain('<a');
            expect(html).toContain('href="https://example.com"');
            expect(html).toContain('href="./file.pdf"');

            // Check for button text
            expect(html).toContain('Click Me');
            expect(html).toContain('Download File');
            expect(html).toContain('Cancel');
            expect(html).toContain('Disabled Button');
            expect(html).toContain('Same Tab');
            expect(html).toContain('Ghost Button');
        });

        it('should render specific button styles correctly', () => {
            // Test each button type individually
            const primaryButton = '[button:Primary](https://example.com){primary}';
            const primaryHtml = engine.toHtml(primaryButton);
            expect(primaryHtml).toContain('bg-blue-600');
            expect(primaryHtml).toContain('px-4 py-2'); // md default

            const successButton = '[button:Success](./file.pdf){success,lg}';
            const successHtml = engine.toHtml(successButton);
            expect(successHtml).toContain('bg-green-600');
            expect(successHtml).toContain('px-6 py-3'); // lg

            const outlineButton = '[button:Outline](#){outline,sm}';
            const outlineHtml = engine.toHtml(outlineButton);
            expect(outlineHtml).toContain('border-blue-600');
            expect(outlineHtml).toContain('px-3 py-1.5'); // sm

            const ghostButton = '[button:Ghost](#){ghost}';
            const ghostHtml = engine.toHtml(ghostButton);
            expect(ghostHtml).toContain('text-gray-700');
            expect(ghostHtml).toContain('hover:bg-gray-100');
        });

        it('should parse button options correctly', () => {
            const markdown = '[button:Test](https://test.com){success,lg,disabled}';
            const tokens = engine.parse(markdown);

            const buttonToken = tokens.find(t => t.type === 'button');
            expect(buttonToken?.content).toBe('Test');
            expect(buttonToken?.attributes?.href).toBe('https://test.com');
            expect(buttonToken?.attributes?.style).toBe('success');
            expect(buttonToken?.attributes?.size).toBe('lg');
            expect(buttonToken?.attributes?.disabled).toBe('true');
        });

        it('should handle target attributes correctly', () => {
            const selfTargetButton = '[button:Self](https://example.com){primary,self}';
            const selfHtml = engine.toHtml(selfTargetButton);
            expect(selfHtml).toContain('target="_self"');
            expect(selfHtml).not.toContain('target="_blank"');

            const blankTargetButton = '[button:Blank](https://example.com){primary}';
            const blankHtml = engine.toHtml(blankTargetButton);
            expect(blankHtml).toContain('target="_blank"');
            expect(blankHtml).toContain('rel="noopener noreferrer"');
        });

        it('should handle disabled buttons correctly', () => {
            const disabledButton = '[button:Disabled](#){danger,disabled}';
            const html = engine.toHtml(disabledButton);

            expect(html).toContain('aria-disabled="true"');
            expect(html).toContain('tabindex="-1"');
            expect(html).toContain('bg-red-600'); // danger style
            expect(html).not.toContain('<svg'); // no external icon for disabled
        });
    });

    describe('EmbedExtension', () => {
        it('should parse and render all embed types', () => {
            const markdown = loadTestContent('embeds.md');
            const html = engine.toHtml(markdown);

            // Check for iframe embeds
            expect(html).toContain('<iframe');
            expect(html).toContain('youtube.com/embed/');
            expect(html).toContain('codepen.io/');
            expect(html).toContain('player.vimeo.com/');
            expect(html).toContain('open.spotify.com/embed/');
            expect(html).toContain('figma.com/embed');

            // Check for social embeds (non-iframe)
            expect(html).toContain('GitHub Repository');
            expect(html).toContain('Twitter Post');

            // Check for embed containers
            expect(html).toContain('rounded-lg border');
            expect(html).toContain('bg-card');

            // Check for responsive containers
            expect(html).toContain('padding-bottom: 56.25%'); // 16:9 aspect ratio
        });

        it('should handle YouTube embeds with options', () => {
            const markdown = '[embed:youtube](https://www.youtube.com/watch?v=test123){autoplay:1,mute:1}';
            const html = engine.toHtml(markdown);

            expect(html).toContain('youtube.com/embed/test123');
            expect(html).toContain('autoplay=1');
            expect(html).toContain('mute=1');
            expect(html).toContain('allowfullscreen');
        });

        it('should handle CodePen embeds', () => {
            const markdown = '[embed:codepen](https://codepen.io/user/pen/abc123){height:400,theme:dark}';
            const html = engine.toHtml(markdown);

            expect(html).toContain('codepen.io/user/embed/abc123');
            expect(html).toContain('height="400"');
            expect(html).toContain('theme-id=dark');
        });

        it('should handle GitHub repository embeds', () => {
            const markdown = '[embed:github](https://github.com/user/repo)';
            const html = engine.toHtml(markdown);

            expect(html).toContain('user/repo');
            expect(html).toContain('GitHub Repository');
            expect(html).toContain('View on GitHub');
            expect(html).toContain('href="https://github.com/user/repo"');
        });

        it('should handle invalid URLs gracefully', () => {
            const markdown = '[embed:youtube](invalid-url)';
            const html = engine.toHtml(markdown);

            expect(html).toContain('Invalid YouTube URL');
            expect(html).toContain('invalid-url');
        });

        it('should parse embed tokens correctly', () => {
            const markdown = '[embed:youtube](https://youtube.com/watch?v=abc){autoplay:1}';
            const tokens = engine.parse(markdown);

            const embedToken = tokens.find(t => t.type === 'embed');
            expect(embedToken?.content).toBe('https://youtube.com/watch?v=abc');
            expect(embedToken?.attributes?.provider).toBe('youtube');
            expect(embedToken?.attributes?.url).toBe('https://youtube.com/watch?v=abc');
            expect(embedToken?.attributes?.options).toBe('autoplay:1');
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

        it('should allow unregistering extensions', () => {
            const success = engine.unregisterExtension('alert');
            expect(success).toBe(true);
            expect(engine.hasExtension('alert')).toBe(false);
        });

        it('should handle mixed extension content', () => {
            const markdown = `
# Test Page

:::info
This page demonstrates extensions.
:::

[button:Learn More](https://example.com){primary}

[embed:youtube](https://youtube.com/watch?v=test)
`;

            const html = engine.toHtml(markdown);

            expect(html).toContain('<h1');
            expect(html).toContain('bg-blue-500/10'); // alert
            expect(html).toContain('bg-blue-600'); // button
            expect(html).toContain('youtube.com/embed/'); // embed
        });
    });

    describe('Custom Extensions', () => {
        it('should allow registering custom extensions', () => {
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
                    render: (token: any) => `<mark class="bg-yellow-200">${token.content}</mark>`
                }]
            };

            const result = engine.registerExtension(customExtension);
            expect(result.success).toBe(true);
            expect(engine.hasExtension('highlight')).toBe(true);

            const html = engine.toHtml('This is ==highlighted text==.');
            expect(html).toContain('<mark');
            expect(html).toContain('bg-yellow-200');
            expect(html).toContain('highlighted text');
        });
    });
});