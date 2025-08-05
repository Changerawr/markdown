/**
 * Parser tests for @changerawr/markdown
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MarkdownParser } from '../src/parser';

describe('MarkdownParser', () => {
    let parser: MarkdownParser;

    // Helper to load test content
    const loadTestContent = (filename: string): string => {
        return readFileSync(join(__dirname, 'content/parser', filename), 'utf-8');
    };

    beforeEach(() => {
        parser = new MarkdownParser();
    });

    describe('Headings', () => {
        it('should parse all heading levels correctly', () => {
            const markdown = loadTestContent('headings.md');
            const tokens = parser.parse(markdown);

            const headingTokens = tokens.filter(t => t.type === 'heading');
            expect(headingTokens).toHaveLength(6);

            expect(headingTokens[0]?.content).toBe('Heading 1');
            expect(headingTokens[0]?.attributes?.level).toBe('1');

            expect(headingTokens[5]?.content).toBe('Heading 6');
            expect(headingTokens[5]?.attributes?.level).toBe('6');
        });
    });

    describe('Text Formatting', () => {
        it('should parse bold, italic, code, links, and images', () => {
            const markdown = loadTestContent('formatting.md');
            const tokens = parser.parse(markdown);

            const boldToken = tokens.find(t => t.type === 'bold');
            expect(boldToken?.content).toBe('bold text');

            const italicToken = tokens.find(t => t.type === 'italic');
            expect(italicToken?.content).toBe('italic text');

            const codeToken = tokens.find(t => t.type === 'code');
            expect(codeToken?.content).toBe('inline code');

            const linkToken = tokens.find(t => t.type === 'link');
            expect(linkToken?.content).toBe('link');
            expect(linkToken?.attributes?.href).toBe('https://example.com');

            const imageToken = tokens.find(t => t.type === 'image');
            expect(imageToken?.content).toBe('Alt text');
            expect(imageToken?.attributes?.src).toBe('https://example.com/image.jpg');
            expect(imageToken?.attributes?.title).toBe('Image title');
        });
    });

    describe('Code Blocks', () => {
        it('should parse code blocks with language', () => {
            const markdown = loadTestContent('codeblock.md');
            const tokens = parser.parse(markdown);

            const codeBlockToken = tokens.find(t => t.type === 'codeblock');
            expect(codeBlockToken?.content).toBe('const x = 5;\nconsole.log(x);');
            expect(codeBlockToken?.attributes?.language).toBe('javascript');
        });
    });

    describe('Lists', () => {
        it('should parse regular and task lists', () => {
            const markdown = loadTestContent('lists.md');
            const tokens = parser.parse(markdown);

            const listTokens = tokens.filter(t => t.type === 'list-item');
            expect(listTokens).toHaveLength(3);
            expect(listTokens[0]?.content).toBe('Item 1');

            const taskTokens = tokens.filter(t => t.type === 'task-item');
            expect(taskTokens).toHaveLength(2);
            expect(taskTokens[0]?.attributes?.checked).toBe('true');
            expect(taskTokens[1]?.attributes?.checked).toBe('false');
        });
    });

    describe('Complex Content', () => {
        it('should handle mixed markdown elements', () => {
            const markdown = loadTestContent('complex.md');
            const tokens = parser.parse(markdown);

            const tokenTypes = new Set(tokens.map(t => t.type));
            expect(tokenTypes).toContain('heading');
            expect(tokenTypes).toContain('bold');
            expect(tokenTypes).toContain('italic');
            expect(tokenTypes).toContain('code');
            expect(tokenTypes).toContain('codeblock');
            expect(tokenTypes).toContain('link');
            expect(tokenTypes).toContain('image');
            expect(tokenTypes).toContain('list-item');
            expect(tokenTypes).toContain('blockquote');
            expect(tokenTypes).toContain('hr');
        });
    });

    describe('Error Handling', () => {
        it('should handle empty input', () => {
            const tokens = parser.parse('');
            expect(tokens).toEqual([]);
        });

        it('should handle malformed markdown', () => {
            const markdown = loadTestContent('malformed.md');
            const parserWithValidation = new MarkdownParser({ validateMarkdown: true });

            const tokens = parserWithValidation.parse(markdown);
            expect(tokens.length).toBeGreaterThan(0);

            const warnings = parserWithValidation.getWarnings();
            expect(warnings.length).toBeGreaterThan(0);
        });

        it('should respect max iterations', () => {
            const limitedParser = new MarkdownParser({ maxIterations: 5 });
            const longText = 'word '.repeat(100);

            limitedParser.parse(longText);
            const warnings = limitedParser.getWarnings();
            expect(warnings.some(w => w.includes('maximum iterations'))).toBe(true);
        });
    });

    describe('Configuration', () => {
        it('should return current configuration', () => {
            const config = { debugMode: true, maxIterations: 100 };
            const configuredParser = new MarkdownParser(config);

            const returnedConfig = configuredParser.getConfig();
            expect(returnedConfig.debugMode).toBe(true);
            expect(returnedConfig.maxIterations).toBe(100);
        });
    });

    describe('Custom Rules', () => {
        it('should allow adding custom parse rules', () => {
            parser.addRule({
                name: 'highlight',
                pattern: /==(.+)==/g,
                render: (match) => ({
                    type: 'highlight',
                    content: match[1] || '',
                    raw: match[0] || ''
                })
            });

            const tokens = parser.parse('This is ==highlighted text==.');
            const highlightToken = tokens.find(t => t.type === 'highlight');

            expect(highlightToken?.content).toBe('highlighted text');
        });
    });
});