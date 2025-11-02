// tests/core-extensions.test.ts
/**
 * Core Extensions tests for @changerawr/markdown
 * Tests each core extension individually
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownParser } from '../src/parser';
import { MarkdownRenderer } from '../src/renderer';
import {
    TextExtension,
    HeadingExtension,
    BoldExtension,
    ItalicExtension,
    InlineCodeExtension,
    CodeBlockExtension,
    LinkExtension,
    ImageExtension,
    ListExtension,
    TaskListExtension,
    BlockquoteExtension,
    HorizontalRuleExtension,
    ParagraphExtension,
    LineBreakExtension
} from '../src/extensions/core';

describe('Core Extensions', () => {
    let parser: MarkdownParser;
    let renderer: MarkdownRenderer;

    beforeEach(() => {
        parser = new MarkdownParser();
        renderer = new MarkdownRenderer();
    });

    describe('TextExtension', () => {
        beforeEach(() => {
            TextExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should render text content safely', () => {
            const tokens = [{ type: 'text', content: 'Hello World', raw: 'Hello World' }];
            const html = renderer.render(tokens);
            expect(html).toBe('Hello World');
        });

        it('should escape HTML in text', () => {
            const tokens = [{ type: 'text', content: '<script>alert("xss")</script>', raw: '<script>alert("xss")</script>' }];
            const html = renderer.render(tokens);
            expect(html).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });

        it('should handle empty content', () => {
            const tokens = [{ type: 'text', content: '', raw: '' }];
            const html = renderer.render(tokens);
            expect(html).toBe('');
        });
    });

    describe('HeadingExtension', () => {
        beforeEach(() => {
            HeadingExtension.parseRules.forEach(rule => parser.addRule(rule));
            HeadingExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse heading levels correctly', () => {
            const testCases = [
                { markdown: '# Level 1', level: '1', content: 'Level 1' },
                { markdown: '## Level 2', level: '2', content: 'Level 2' },
                { markdown: '### Level 3', level: '3', content: 'Level 3' },
                { markdown: '#### Level 4', level: '4', content: 'Level 4' },
                { markdown: '##### Level 5', level: '5', content: 'Level 5' },
                { markdown: '###### Level 6', level: '6', content: 'Level 6' }
            ];

            testCases.forEach(testCase => {
                const tokens = parser.parse(testCase.markdown);
                const headingToken = tokens.find(t => t.type === 'heading');

                expect(headingToken).toBeDefined();
                expect(headingToken?.content).toBe(testCase.content);
                expect(headingToken?.attributes?.level).toBe(testCase.level);
            });
        });

        it('should render headings with HTML format', () => {
            const token = {
                type: 'heading',
                content: 'Test Heading',
                raw: '# Test Heading',
                attributes: { level: '1', format: 'html' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('<h1');
            expect(html).toContain('id="test-heading"');
            expect(html).toContain('Test Heading');
            expect(html).toContain('</h1>');
        });

        it('should render headings with Tailwind format', () => {
            const token = {
                type: 'heading',
                content: 'Test Heading',
                raw: '# Test Heading',
                attributes: { level: '1', format: 'tailwind' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('text-3xl');
            expect(html).toContain('font-bold');
            expect(html).toContain('Test Heading');
        });

        it('should generate proper IDs for headings', () => {
            const testCases = [
                { content: 'Simple Heading', expectedId: 'simple-heading' },
                { content: 'Heading with Spaces', expectedId: 'heading-with-spaces' },
                { content: 'Heading with Numbers 123', expectedId: 'heading-with-numbers-123' }
            ];

            testCases.forEach(testCase => {
                const token = {
                    type: 'heading',
                    content: testCase.content,
                    raw: `# ${testCase.content}`,
                    attributes: { level: '1', format: 'html' }
                };

                const html = renderer.render([token]);
                expect(html).toContain(`id="${testCase.expectedId}"`);
            });
        });
    });

    describe('BoldExtension', () => {
        beforeEach(() => {
            BoldExtension.parseRules.forEach(rule => parser.addRule(rule));
            BoldExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse bold text correctly', () => {
            const markdown = 'This is **bold text** in a sentence.';
            const tokens = parser.parse(markdown);

            const boldToken = tokens.find(t => t.type === 'bold');
            expect(boldToken).toBeDefined();
            expect(boldToken?.content).toBe('bold text');
        });

        it('should render bold with HTML format', () => {
            // Use HTML format renderer
            const htmlRenderer = new MarkdownRenderer({ format: 'html' });
            BoldExtension.renderRules.forEach(rule => htmlRenderer.addRule(rule));

            const tokens = [{ type: 'bold', content: 'bold text', raw: '**bold text**' }];
            const html = htmlRenderer.render(tokens);
            expect(html).toBe('<strong>bold text</strong>');
        });

        it('should render bold with Tailwind format', () => {
            // Use Tailwind format renderer (default)
            const tailwindRenderer = new MarkdownRenderer({ format: 'tailwind' });
            BoldExtension.renderRules.forEach(rule => tailwindRenderer.addRule(rule));

            const tokens = [{ type: 'bold', content: 'bold text', raw: '**bold text**' }];
            const html = tailwindRenderer.render(tokens);
            expect(html).toBe('<strong class="font-bold">bold text</strong>');
        });

        it('should not match across line breaks', () => {
            const markdown = 'This is **unclosed bold\nThis is another line';
            const tokens = parser.parse(markdown);

            const boldTokens = tokens.filter(t => t.type === 'bold');
            expect(boldTokens).toHaveLength(0);
        });
    });

    describe('ItalicExtension', () => {
        beforeEach(() => {
            ItalicExtension.parseRules.forEach(rule => parser.addRule(rule));
            ItalicExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse italic text correctly', () => {
            const markdown = 'This is *italic text* in a sentence.';
            const tokens = parser.parse(markdown);

            const italicToken = tokens.find(t => t.type === 'italic');
            expect(italicToken).toBeDefined();
            expect(italicToken?.content).toBe('italic text');
        });

        it('should render italic with HTML format', () => {
            // Use HTML format renderer
            const htmlRenderer = new MarkdownRenderer({ format: 'html' });
            ItalicExtension.renderRules.forEach(rule => htmlRenderer.addRule(rule));

            const tokens = [{ type: 'italic', content: 'italic text', raw: '*italic text*' }];
            const html = htmlRenderer.render(tokens);
            expect(html).toBe('<em>italic text</em>');
        });

        it('should render italic with Tailwind format', () => {
            // Use Tailwind format renderer (default)
            const tailwindRenderer = new MarkdownRenderer({ format: 'tailwind' });
            ItalicExtension.renderRules.forEach(rule => tailwindRenderer.addRule(rule));

            const tokens = [{ type: 'italic', content: 'italic text', raw: '*italic text*' }];
            const html = tailwindRenderer.render(tokens);
            expect(html).toBe('<em class="italic">italic text</em>');
        });
    });

    describe('InlineCodeExtension', () => {
        beforeEach(() => {
            InlineCodeExtension.parseRules.forEach(rule => parser.addRule(rule));
            InlineCodeExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse inline code correctly', () => {
            const markdown = 'Use `console.log()` for debugging.';
            const tokens = parser.parse(markdown);

            const codeToken = tokens.find(t => t.type === 'code');
            expect(codeToken).toBeDefined();
            expect(codeToken?.content).toBe('console.log()');
        });

        it('should render inline code with HTML format', () => {
            // Use HTML format renderer
            const htmlRenderer = new MarkdownRenderer({ format: 'html' });
            InlineCodeExtension.renderRules.forEach(rule => htmlRenderer.addRule(rule));

            const tokens = [{ type: 'code', content: 'console.log()', raw: '`console.log()`' }];
            const html = htmlRenderer.render(tokens);
            expect(html).toContain('<code');
            expect(html).toContain('console.log()');
            expect(html).toContain('monospace');
        });

        it('should render inline code with Tailwind format', () => {
            // Use Tailwind format renderer (default)
            const tailwindRenderer = new MarkdownRenderer({ format: 'tailwind' });
            InlineCodeExtension.renderRules.forEach(rule => tailwindRenderer.addRule(rule));

            const tokens = [{ type: 'code', content: 'console.log()', raw: '`console.log()`' }];
            const html = tailwindRenderer.render(tokens);
            expect(html).toContain('bg-muted');
            expect(html).toContain('font-mono');
            expect(html).toContain('console.log()');
        });
    });

    describe('CodeBlockExtension', () => {
        beforeEach(() => {
            CodeBlockExtension.parseRules.forEach(rule => parser.addRule(rule));
            CodeBlockExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse code blocks with language', () => {
            const markdown = '```javascript\nconst x = 5;\nconsole.log(x);\n```';
            const tokens = parser.parse(markdown);

            const codeBlockToken = tokens.find(t => t.type === 'codeblock');
            expect(codeBlockToken).toBeDefined();
            expect(codeBlockToken?.content).toBe('const x = 5;\nconsole.log(x);');
            expect(codeBlockToken?.attributes?.language).toBe('javascript');
        });

        it('should parse code blocks without language', () => {
            const markdown = '```\nconst x = 5;\n```';
            const tokens = parser.parse(markdown);

            const codeBlockToken = tokens.find(t => t.type === 'codeblock');
            expect(codeBlockToken).toBeDefined();
            expect(codeBlockToken?.attributes?.language).toBe('text');
        });

        it('should render code blocks with HTML format', () => {
            const token = {
                type: 'codeblock',
                content: 'const x = 5;',
                raw: '```javascript\nconst x = 5;\n```',
                attributes: { language: 'javascript', format: 'html' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('<pre');
            expect(html).toContain('<code');
            expect(html).toContain('language-javascript');
            expect(html).toContain('const x = 5;');
        });

        it('should render code blocks with Tailwind format', () => {
            const token = {
                type: 'codeblock',
                content: 'const x = 5;',
                raw: '```javascript\nconst x = 5;\n```',
                attributes: { language: 'javascript', format: 'tailwind' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('bg-muted');
            expect(html).toContain('language-javascript');
            expect(html).toContain('const x = 5;');
        });
    });

    describe('LinkExtension', () => {
        beforeEach(() => {
            LinkExtension.parseRules.forEach(rule => parser.addRule(rule));
            LinkExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse regular links correctly', () => {
            const markdown = '[Google](https://google.com)';
            const tokens = parser.parse(markdown);

            const linkToken = tokens.find(t => t.type === 'link');
            expect(linkToken).toBeDefined();
            expect(linkToken?.content).toBe('Google');
            expect(linkToken?.attributes?.href).toBe('https://google.com');
        });

        it('should not parse button syntax as links', () => {
            const markdown = '[button:Click Me](https://example.com)';
            const tokens = parser.parse(markdown);

            const linkTokens = tokens.filter(t => t.type === 'link');
            expect(linkTokens).toHaveLength(0);
        });

        it('should not parse embed syntax as links', () => {
            const markdown = '[embed:youtube](https://youtube.com/watch?v=test)';
            const tokens = parser.parse(markdown);

            const linkTokens = tokens.filter(t => t.type === 'link');
            expect(linkTokens).toHaveLength(0);
        });

        it('should render links with external attributes', () => {
            const token = {
                type: 'link',
                content: 'Google',
                raw: '[Google](https://google.com)',
                attributes: { href: 'https://google.com', format: 'html' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('href="https://google.com"');
            expect(html).toContain('target="_blank"');
            expect(html).toContain('rel="noopener noreferrer"');
            expect(html).toContain('Google');
        });

        it('should render links with Tailwind classes', () => {
            const token = {
                type: 'link',
                content: 'Google',
                raw: '[Google](https://google.com)',
                attributes: { href: 'https://google.com', format: 'tailwind' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('text-primary');
            expect(html).toContain('hover:underline');
            expect(html).toContain('<svg'); // external link icon
        });
    });

    describe('ImageExtension', () => {
        beforeEach(() => {
            ImageExtension.parseRules.forEach(rule => parser.addRule(rule));
            ImageExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse images correctly', () => {
            const markdown = '![Alt text](image.jpg "Image title")';
            const tokens = parser.parse(markdown);

            const imageToken = tokens.find(t => t.type === 'image');
            expect(imageToken).toBeDefined();
            expect(imageToken?.content).toBe('Alt text');
            expect(imageToken?.attributes?.src).toBe('image.jpg');
            expect(imageToken?.attributes?.alt).toBe('Alt text');
            expect(imageToken?.attributes?.title).toBe('Image title');
        });

        it('should parse images without title', () => {
            const markdown = '![Alt text](image.jpg)';
            const tokens = parser.parse(markdown);

            const imageToken = tokens.find(t => t.type === 'image');
            expect(imageToken).toBeDefined();
            expect(imageToken?.attributes?.title).toBe('');
        });

        it('should render images with proper attributes', () => {
            const token = {
                type: 'image',
                content: 'Alt text',
                raw: '![Alt text](image.jpg)',
                attributes: { src: 'image.jpg', alt: 'Alt text', format: 'html' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('<img');
            expect(html).toContain('src="image.jpg"');
            expect(html).toContain('alt="Alt text"');
            expect(html).toContain('loading="lazy"');
        });

        it('should render images with Tailwind classes', () => {
            const token = {
                type: 'image',
                content: 'Alt text',
                raw: '![Alt text](image.jpg)',
                attributes: { src: 'image.jpg', alt: 'Alt text', format: 'tailwind' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('max-w-full');
            expect(html).toContain('h-auto');
            expect(html).toContain('rounded-lg');
        });
    });

    describe('ListExtension', () => {
        beforeEach(() => {
            ListExtension.parseRules.forEach(rule => parser.addRule(rule));
            ListExtension.renderRules.forEach(rule => renderer.addRule(rule));
            // Add formatting extensions for inline content support
            BoldExtension.parseRules.forEach(rule => parser.addRule(rule));
            BoldExtension.renderRules.forEach(rule => renderer.addRule(rule));
            ItalicExtension.parseRules.forEach(rule => parser.addRule(rule));
            ItalicExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse list items correctly', () => {
            const markdown = '- Item 1\n- Item 2\n- Item 3';
            const tokens = parser.parse(markdown);

            const listItems = tokens.filter(t => t.type === 'list-item');
            expect(listItems).toHaveLength(3);
            expect(listItems[0]?.content).toBe('Item 1');
            expect(listItems[1]?.content).toBe('Item 2');
            expect(listItems[2]?.content).toBe('Item 3');
        });

        it('should parse different list markers', () => {
            const markers = ['-', '*', '+'];

            markers.forEach(marker => {
                const markdown = `${marker} Test item`;
                const tokens = parser.parse(markdown);

                const listItem = tokens.find(t => t.type === 'list-item');
                expect(listItem).toBeDefined();
                expect(listItem?.content).toBe('Test item');
            });
        });

        it('should render list items', () => {
            const token = {
                type: 'list-item',
                content: 'Test item',
                raw: '- Test item'
            };

            const html = renderer.render([token]);
            expect(html).toBe('<li>Test item</li>');
        });

        it('should parse and render bold formatting within list items', () => {
            const markdown = '- **Technical**: Impact is high\n- Details about *italic* formatting';
            const tokens = parser.parse(markdown);

            const listItems = tokens.filter(t => t.type === 'list-item');
            expect(listItems).toHaveLength(2);
            // First item should have bold formatting in its children
            expect(listItems[0]?.children).toBeDefined();
            expect(listItems[0]?.children?.some(c => c.type === 'bold')).toBe(true);

            const html = renderer.render(tokens);
            expect(html).toContain('<strong class="font-bold">Technical</strong>');
            expect(html).toContain('<em class="italic">italic</em>');
        });
    });

    describe('TaskListExtension', () => {
        beforeEach(() => {
            TaskListExtension.parseRules.forEach(rule => parser.addRule(rule));
            TaskListExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse task items correctly', () => {
            const markdown = '- [x] Completed task\n- [ ] Todo task\n- [X] Another completed';
            const tokens = parser.parse(markdown);

            const taskItems = tokens.filter(t => t.type === 'task-item');
            expect(taskItems).toHaveLength(3);
            expect(taskItems[0]?.attributes?.checked).toBe('true');
            expect(taskItems[1]?.attributes?.checked).toBe('false');
            expect(taskItems[2]?.attributes?.checked).toBe('true');
        });

        it('should render task items with checkboxes', () => {
            const completedToken = {
                type: 'task-item',
                content: 'Completed task',
                raw: '- [x] Completed task',
                attributes: { checked: 'true', format: 'html' }
            };

            const html = renderer.render([completedToken]);
            expect(html).toContain('<input');
            expect(html).toContain('type="checkbox"');
            expect(html).toContain('checked');
            expect(html).toContain('disabled');
            expect(html).toContain('Completed task');
        });

        it('should render incomplete tasks', () => {
            const incompleteToken = {
                type: 'task-item',
                content: 'Todo task',
                raw: '- [ ] Todo task',
                attributes: { checked: 'false', format: 'html' }
            };

            const html = renderer.render([incompleteToken]);
            expect(html).toContain('<input');
            expect(html).toContain('type="checkbox"');
            expect(html).not.toContain('checked');
            expect(html).toContain('Todo task');
        });
    });

    describe('BlockquoteExtension', () => {
        beforeEach(() => {
            BlockquoteExtension.parseRules.forEach(rule => parser.addRule(rule));
            BlockquoteExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse blockquotes correctly', () => {
            const markdown = '> This is a quote\n> Continued quote';
            const tokens = parser.parse(markdown);

            const blockquoteTokens = tokens.filter(t => t.type === 'blockquote');
            expect(blockquoteTokens.length).toBeGreaterThan(0);
            expect(blockquoteTokens[0]?.content).toBe('This is a quote');
        });

        it('should render blockquotes with HTML format', () => {
            const token = {
                type: 'blockquote',
                content: 'This is a quote',
                raw: '> This is a quote',
                attributes: { format: 'html' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('<blockquote');
            expect(html).toContain('This is a quote');
            expect(html).toContain('italic');
        });

        it('should render blockquotes with Tailwind format', () => {
            const token = {
                type: 'blockquote',
                content: 'This is a quote',
                raw: '> This is a quote',
                attributes: { format: 'tailwind' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('pl-4');
            expect(html).toContain('border-l-2');
            expect(html).toContain('This is a quote');
        });

        it('should render nested markdown inside blockquotes', () => {
            const token = {
                type: 'blockquote',
                content: 'This has **bold** and *italic* text',
                raw: '> This has **bold** and *italic* text',
                attributes: {
                    format: 'tailwind',
                    renderMarkdown: (md: string) => {
                        // Simulate the recursive markdown rendering
                        return md
                            .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
                            .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
                    }
                }
            };

            const html = renderer.render([token]);

            // Should render markdown elements
            expect(html).toContain('<strong');
            expect(html).toContain('bold</strong>');
            expect(html).toContain('<em');
            expect(html).toContain('italic</em>');

            // Should not have raw markdown syntax
            expect(html).not.toContain('**bold**');
            expect(html).not.toContain('*italic*');
        });
    });

    describe('HorizontalRuleExtension', () => {
        beforeEach(() => {
            HorizontalRuleExtension.parseRules.forEach(rule => parser.addRule(rule));
            HorizontalRuleExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse horizontal rules correctly', () => {
            const markdown = '---';
            const tokens = parser.parse(markdown);

            const hrToken = tokens.find(t => t.type === 'hr');
            expect(hrToken).toBeDefined();
        });

        it('should render horizontal rules with HTML format', () => {
            // Use HTML format renderer
            const htmlRenderer = new MarkdownRenderer({ format: 'html' });
            HorizontalRuleExtension.renderRules.forEach(rule => htmlRenderer.addRule(rule));

            const tokens = [{ type: 'hr', content: '', raw: '---' }];
            const html = htmlRenderer.render(tokens);
            expect(html).toContain('<hr');
            expect(html).toContain('border-top');
        });

        it('should render horizontal rules with Tailwind format', () => {
            // Use Tailwind format renderer (default)
            const tailwindRenderer = new MarkdownRenderer({ format: 'tailwind' });
            HorizontalRuleExtension.renderRules.forEach(rule => tailwindRenderer.addRule(rule));

            const tokens = [{ type: 'hr', content: '', raw: '---' }];
            const html = tailwindRenderer.render(tokens);
            expect(html).toContain('<hr');
            expect(html).toContain('border-t');
        });
    });

    describe('ParagraphExtension', () => {
        beforeEach(() => {
            ParagraphExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should render paragraphs with content', () => {
            const token = {
                type: 'paragraph',
                content: 'This is a paragraph.',
                raw: 'This is a paragraph.',
                attributes: { format: 'html' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('<p');
            expect(html).toContain('This is a paragraph.');
            expect(html).toContain('</p>');
        });

        it('should not render empty paragraphs', () => {
            const token = {
                type: 'paragraph',
                content: '',
                raw: '',
                attributes: { format: 'html' }
            };

            const html = renderer.render([token]);
            expect(html).toBe('');
        });

        it('should render paragraphs with Tailwind classes', () => {
            const token = {
                type: 'paragraph',
                content: 'This is a paragraph.',
                raw: 'This is a paragraph.',
                attributes: { format: 'tailwind' }
            };

            const html = renderer.render([token]);
            expect(html).toContain('leading-7');
            expect(html).toContain('mb-4');
        });
    });

    describe('LineBreakExtension', () => {
        beforeEach(() => {
            LineBreakExtension.parseRules.forEach(rule => parser.addRule(rule));
            LineBreakExtension.renderRules.forEach(rule => renderer.addRule(rule));
        });

        it('should parse hard line breaks with backslash', () => {
            const markdown = 'Line one\\\nLine two';
            const tokens = parser.parse(markdown);

            const lineBreakToken = tokens.find(t => t.type === 'line-break');
            expect(lineBreakToken).toBeDefined();
        });

        it('should parse hard line breaks with spaces', () => {
            const markdown = 'Line one  \nLine two';
            const tokens = parser.parse(markdown);

            const lineBreakToken = tokens.find(t => t.type === 'line-break');
            expect(lineBreakToken).toBeDefined();
        });

        it('should render line breaks', () => {
            const token = {
                type: 'line-break',
                content: '',
                raw: '\\\n'
            };

            const html = renderer.render([token]);
            expect(html).toBe('<br>');
        });

        it('should render soft breaks', () => {
            const token = {
                type: 'soft-break',
                content: ' ',
                raw: '\n'
            };

            const html = renderer.render([token]);
            expect(html).toBe(' ');
        });
    });

    describe('Integration Tests', () => {
        beforeEach(() => {
            // Register all core extensions
            [
                TextExtension,
                HeadingExtension,
                BoldExtension,
                ItalicExtension,
                InlineCodeExtension,
                CodeBlockExtension,
                LinkExtension,
                ImageExtension,
                ListExtension,
                TaskListExtension,
                BlockquoteExtension,
                HorizontalRuleExtension,
                ParagraphExtension,
                LineBreakExtension
            ].forEach(extension => {
                extension.parseRules.forEach(rule => parser.addRule(rule));
                extension.renderRules.forEach(rule => renderer.addRule(rule));
            });
        });

        it('should handle mixed markdown content', () => {
            const markdown = `# Main Title

This is a paragraph with **bold** and *italic* text, plus \`inline code\`.

## Subheading

- List item one
- List item two

> This is a blockquote

[This is a link](https://example.com)

![Alt text](image.jpg)

---

\`\`\`javascript
const code = "block";
\`\`\`

- [x] Completed task
- [ ] Incomplete task`;

            const tokens = parser.parse(markdown);
            const html = renderer.render(tokens);

            // Should contain various elements
            expect(html).toContain('<h1');
            expect(html).toContain('<h2');
            expect(html).toContain('<strong');
            expect(html).toContain('<em');
            expect(html).toContain('<code');
            expect(html).toContain('<li');
            expect(html).toContain('<blockquote');
            expect(html).toContain('<a');
            expect(html).toContain('<img');
            expect(html).toContain('<hr');
            expect(html).toContain('<pre');
            expect(html).toContain('type="checkbox"');
        });

        it('should prioritize more specific patterns', () => {
            const markdown = '![Image](test.jpg) and [Link](test.html)';
            const tokens = parser.parse(markdown);

            const imageTokens = tokens.filter(t => t.type === 'image');
            const linkTokens = tokens.filter(t => t.type === 'link');

            expect(imageTokens).toHaveLength(1);
            expect(linkTokens).toHaveLength(1);
            expect(imageTokens[0]?.content).toBe('Image');
            expect(linkTokens[0]?.content).toBe('Link');
        });
    });
});