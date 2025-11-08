/**
 * Stress tests with all markdown features combined
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChangerawrMarkdown } from '../src/engine';

// Generate realistic markdown with all features mixed together
function generateRichMarkdown(wordCount: number): string {
    const sections: string[] = [];
    let currentWords = 0;

    const templates = [
        () => `## Section ${Math.floor(currentWords / 100)}`,
        () => `:::info Quick Tip
Use **keyboard shortcuts** to save time. Press \`Ctrl+S\` to save your work.
:::`,
        () => `:::warning Watch Out
Don't forget to run \`npm install\` before starting the dev server.
:::`,
        () => `[View Documentation](https://docs.example.com){.button variant="primary"}`,
        () => `\`\`\`javascript
const result = data.filter(item => item.active)
  .map(item => item.value);
\`\`\``,
        () => `- First point with **emphasis**
- Second point with a [link](https://example.com)
- Third point with \`inline code\``,
        () => `- [x] Set up project
- [ ] Write tests
- [ ] Deploy to production`,
        () => `> Important: Always backup your data before running migrations.`,
        () => `Check out the [official guide](https://example.com) for more details.`,
        () => `This works with **bold**, *italics*, and even \`code snippets\` all in one line.`,
    ];

    while (currentWords < wordCount) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const content = template();
        sections.push(content);
        currentWords += content.split(/\s+/).length;

        // Add regular paragraphs sometimes
        if (Math.random() > 0.6) {
            sections.push('This is regular paragraph text that provides context between the formatted sections.');
            currentWords += 11;
        }
    }

    return sections.join('\n\n');
}

// Worst case: everything nested and complex
function generateDenseMarkdown(wordCount: number): string {
    const sections: string[] = [];
    let currentWords = 0;

    while (currentWords < wordCount) {
        sections.push(`:::info Nested Content
# Heading here
Content with **bold** and *italic* and \`code\`.

- List item one
- List item two with [a link](https://example.com)

\`\`\`javascript
const x = 42;
\`\`\`

> Quote inside the alert

[Click here](https://example.com){.button}
:::`);

        currentWords += 40;
    }

    return sections.join('\n\n');
}

describe('Stress Tests with All Features', () => {
    let engine: ChangerawrMarkdown;

    beforeEach(() => {
        engine = new ChangerawrMarkdown();
    });

    it('handles 1K words with mixed features', () => {
        const markdown = generateRichMarkdown(1000);
        const start = performance.now();
        const html = engine.toHtml(markdown);
        const duration = performance.now() - start;

        expect(html).toBeTruthy();
        console.log(`1K words (mixed): ${duration.toFixed(2)}ms`);
    }, 10000);

    it('handles 5K words with mixed features', () => {
        const markdown = generateRichMarkdown(5000);
        const start = performance.now();
        const html = engine.toHtml(markdown);
        const duration = performance.now() - start;

        expect(html).toBeTruthy();
        console.log(`5K words (mixed): ${duration.toFixed(2)}ms`);
    }, 30000);

    it('handles 10K words with mixed features', () => {
        const markdown = generateRichMarkdown(10000);
        const start = performance.now();
        const html = engine.toHtml(markdown);
        const duration = performance.now() - start;

        expect(html).toBeTruthy();
        console.log(`10K words (mixed): ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(10000);
    }, 60000);

    it('handles worst case: 10K words with dense nesting', () => {
        const markdown = generateDenseMarkdown(10000);
        const start = performance.now();
        const html = engine.toHtml(markdown);
        const duration = performance.now() - start;

        expect(html).toBeTruthy();
        console.log(`10K words (dense): ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(15000);
    }, 60000);

    it('handles 100 alerts', () => {
        const markdown = Array.from({ length: 100 }, (_, i) =>
            `:::info Alert ${i}
Content with **formatting** and \`code\`.
:::`
        ).join('\n\n');

        const start = performance.now();
        const html = engine.toHtml(markdown);
        const duration = performance.now() - start;

        expect(html).toBeTruthy();
        expect((html.match(/role="alert"/g) || []).length).toBe(100);
        console.log(`100 alerts: ${duration.toFixed(2)}ms`);
    }, 10000);

    it('caches complex content properly', () => {
        const markdown = generateRichMarkdown(5000);

        const firstStart = performance.now();
        const firstHtml = engine.toHtml(markdown);
        const firstDuration = performance.now() - firstStart;

        const secondStart = performance.now();
        const secondHtml = engine.toHtml(markdown);
        const secondDuration = performance.now() - secondStart;

        expect(firstHtml).toBe(secondHtml);
        expect(secondDuration).toBeLessThan(firstDuration / 10);

        console.log(`First: ${firstDuration.toFixed(2)}ms, Cached: ${secondDuration.toFixed(2)}ms (${(firstDuration / secondDuration).toFixed(0)}x faster)`);
    }, 30000);

    describe('Breaking the Barrier - Extreme Scale', () => {
        it('handles 25K words', () => {
            const markdown = generateRichMarkdown(25000);
            const start = performance.now();
            const html = engine.toHtml(markdown);
            const duration = performance.now() - start;

            expect(html).toBeTruthy();
            console.log(`25K words: ${duration.toFixed(2)}ms (${(duration / 1000).toFixed(2)}s)`);
        }, 120000);

        it('handles 50K words', () => {
            const markdown = generateRichMarkdown(50000);
            const start = performance.now();
            const html = engine.toHtml(markdown);
            const duration = performance.now() - start;

            expect(html).toBeTruthy();
            console.log(`50K words: ${duration.toFixed(2)}ms (${(duration / 1000).toFixed(2)}s)`);
        }, 180000);

        it('handles 100K words and caches for instant re-render', () => {
            const markdown = generateRichMarkdown(100000);

            // First render
            const firstStart = performance.now();
            const firstHtml = engine.toHtml(markdown);
            const firstDuration = performance.now() - firstStart;

            expect(firstHtml).toBeTruthy();
            const seconds = firstDuration / 1000;
            console.log(`100K words: ${firstDuration.toFixed(2)}ms (${seconds.toFixed(2)}s)`);
            console.log(`That's approximately ${Math.floor(100000 / seconds)} words per second!`);

            // Second render - cached
            const secondStart = performance.now();
            const secondHtml = engine.toHtml(markdown);
            const secondDuration = performance.now() - secondStart;

            expect(secondHtml).toBe(firstHtml);
            console.log(`100K words (cached): ${secondDuration.toFixed(2)}ms - basically instant!`);
            expect(secondDuration).toBeLessThan(100); // Should be under 100ms with cache
        }, 300000);
    });
});
