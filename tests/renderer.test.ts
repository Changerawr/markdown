/**
 * Renderer tests for @changerawr/markdown
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MarkdownRenderer } from '../src/renderer';
import { ChangerawrMarkdown } from '../src/engine';
import type { MarkdownToken } from '../src/types';

describe('MarkdownRenderer', () => {
    let renderer: MarkdownRenderer;
    let engine: ChangerawrMarkdown;

    // Helper to load test content
    const loadTestContent = (filename: string): string => {
        return readFileSync(join(__dirname, 'content/renderer', filename), 'utf-8');
    };

    beforeEach(() => {
        renderer = new MarkdownRenderer();
        engine = new ChangerawrMarkdown();
    });

    describe('Basic HTML Rendering', () => {
        it('should render headings with proper structure', () => {
            const tokens: MarkdownToken[] = [
                {
                    type: 'heading',
                    content: 'Test Heading',
                    raw: '# Test Heading',
                    attributes: { level: '1' }
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toContain('<h1');
            expect(html).toContain('Test Heading');
            expect(html).toContain('id=');
            expect(html).toContain('</h1>');
        });

        it('should render text formatting correctly', () => {
            const tokens: MarkdownToken[] = [
                {
                    type: 'bold',
                    content: 'bold text',
                    raw: '**bold text**'
                },
                {
                    type: 'italic',
                    content: 'italic text',
                    raw: '*italic text*'
                },
                {
                    type: 'code',
                    content: 'console.log()',
                    raw: '`console.log()`'
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toContain('<strong');
            expect(html).toContain('bold text');
            expect(html).toContain('<em');
            expect(html).toContain('italic text');
            expect(html).toContain('<code');
            expect(html).toContain('console.log()');
        });

        it('should render links with external attributes', () => {
            const tokens: MarkdownToken[] = [
                {
                    type: 'link',
                    content: 'Google',
                    raw: '[Google](https://google.com)',
                    attributes: { href: 'https://google.com' }
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toContain('<a');
            expect(html).toContain('href="https://google.com"');
            expect(html).toContain('target="_blank"');
            expect(html).toContain('rel="noopener noreferrer"');
            expect(html).toContain('Google');
        });

        it('should render images with attributes', () => {
            const tokens: MarkdownToken[] = [
                {
                    type: 'image',
                    content: 'Alt text',
                    raw: '![Alt text](image.jpg "Title")',
                    attributes: {
                        src: 'image.jpg',
                        alt: 'Alt text',
                        title: 'Title'
                    }
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toContain('<img');
            expect(html).toContain('src="image.jpg"');
            expect(html).toContain('alt="Alt text"');
            expect(html).toContain('title="Title"');
        });
    });

    describe('Code Rendering', () => {
        it('should render code blocks with language', () => {
            const markdown = loadTestContent('codeblock.md');
            const html = engine.toHtml(markdown);

            expect(html).toContain('<pre');
            expect(html).toContain('<code');
            expect(html).toContain('language-javascript');
            expect(html).toContain('function hello()');
        });
    });

    describe('List Rendering', () => {
        it('should render task lists with checkboxes', () => {
            const markdown = loadTestContent('tasks.md');
            const html = engine.toHtml(markdown);

            expect(html).toContain('<input');
            expect(html).toContain('type="checkbox"');
            expect(html).toContain('checked');
            expect(html).toContain('disabled');
            expect(html).toContain('Completed task');
            expect(html).toContain('Incomplete task');
        });

        it('should render regular list items', () => {
            const tokens: MarkdownToken[] = [
                {
                    type: 'list-item',
                    content: 'First item',
                    raw: '- First item'
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toContain('<li');
            expect(html).toContain('First item');
            expect(html).toContain('</li>');
        });
    });

    describe('Output Formats', () => {
        it('should render with Tailwind classes by default', () => {
            const tailwindRenderer = new MarkdownRenderer({ format: 'tailwind' });
            const tokens: MarkdownToken[] = [
                {
                    type: 'heading',
                    content: 'Test',
                    raw: '# Test',
                    attributes: { level: '1' }
                }
            ];

            const html = tailwindRenderer.render(tokens);
            expect(html).toContain('class=');
            expect(html).toContain('text-3xl');
            expect(html).toContain('font-bold');
        });

        it('should render plain HTML without CSS classes', () => {
            const htmlRenderer = new MarkdownRenderer({ format: 'html' });
            const tokens: MarkdownToken[] = [
                {
                    type: 'heading',
                    content: 'Test',
                    raw: '# Test',
                    attributes: { level: '1' }
                }
            ];

            const html = htmlRenderer.render(tokens);
            expect(html).toContain('<h1');
            expect(html).toContain('Test');
            expect(html).not.toContain('text-3xl');
            expect(html).not.toContain('class="');
        });
    });

    describe('Security', () => {
        it('should escape dangerous HTML in text', () => {
            const tokens: MarkdownToken[] = [
                {
                    type: 'text',
                    content: '<script>alert("xss")</script>',
                    raw: '<script>alert("xss")</script>'
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toContain('&lt;script&gt;');
            expect(html).not.toContain('<script>alert');
        });
    });

    describe('Error Handling', () => {
        it('should handle unknown token types', () => {
            const tokens: MarkdownToken[] = [
                {
                    type: 'unknown-type',
                    content: 'test content',
                    raw: 'test content'
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toContain('test content');
        });

        it('should handle empty tokens gracefully', () => {
            const tokens: MarkdownToken[] = [
                {
                    type: 'text',
                    content: '',
                    raw: ''
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toBe('');
        });
    });

    describe('Configuration', () => {
        it('should update configuration correctly', () => {
            renderer.updateConfig({ format: 'html' });
            const config = renderer.getConfig();
            expect(config.format).toBe('html');
        });

        it('should track render rules', () => {
            expect(renderer.hasRule('heading')).toBe(true);
            expect(renderer.hasRule('nonexistent')).toBe(false);
        });

        it('should allow custom render rules', () => {
            renderer.addRule({
                type: 'custom',
                render: (token) => `<custom>${token.content}</custom>`
            });

            const tokens: MarkdownToken[] = [
                {
                    type: 'custom',
                    content: 'test',
                    raw: 'test'
                }
            ];

            const html = renderer.render(tokens);
            expect(html).toContain('<custom>test</custom>');
        });
    });

    describe('Integration', () => {
        it('should render complete markdown correctly', () => {
            const markdown = loadTestContent('basic.md');
            const html = engine.toHtml(markdown);

            expect(html).toContain('<h1');
            expect(html).toContain('Main Title');
            expect(html).toContain('<strong');
            expect(html).toContain('bold');
            expect(html).toContain('<em');
            expect(html).toContain('italic');
            expect(html).toContain('<code');
            expect(html).toContain('<a');
            expect(html).toContain('<blockquote');
            expect(html).toContain('<li');
            expect(html).toContain('<hr');
        });
    });
});