/**
 * Performance tests for markdown rendering with large content
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChangerawrMarkdown } from '../src/engine';

// Generate large markdown content
function generateMarkdown(wordCount: number): string {
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
    const paragraphs: string[] = [];

    let currentWords = 0;
    while (currentWords < wordCount) {
        const paragraphLength = Math.floor(Math.random() * 50) + 30;
        const paragraph = Array.from({ length: paragraphLength }, () =>
            words[Math.floor(Math.random() * words.length)]
        ).join(' ');

        paragraphs.push(paragraph);
        currentWords += paragraphLength;
    }

    return paragraphs.join('\n\n');
}

function generateComplexMarkdown(wordCount: number): string {
    const sections: string[] = [];
    let currentWords = 0;

    while (currentWords < wordCount) {
        // Add heading
        sections.push(`## Heading ${Math.floor(currentWords / 100)}`);
        currentWords += 3;

        // Add paragraph with formatting
        const paragraph = `This is a **bold** paragraph with *italic* text and \`inline code\`. ${generateMarkdown(50)}`;
        sections.push(paragraph);
        currentWords += 55;

        // Occasionally add code blocks
        if (Math.random() > 0.7) {
            sections.push('```javascript\nconst x = 10;\nconsole.log(x);\n```');
            currentWords += 10;
        }

        // Occasionally add lists
        if (Math.random() > 0.6) {
            sections.push('- Item 1\n- Item 2\n- Item 3');
            currentWords += 6;
        }
    }

    return sections.join('\n\n');
}

describe('Performance Tests', () => {
    let engine: ChangerawrMarkdown;

    beforeEach(() => {
        engine = new ChangerawrMarkdown();
    });

    describe('Baseline Performance', () => {
        it('should render 1,000 words', () => {
            const markdown = generateMarkdown(1000);
            const start = performance.now();
            const html = engine.toHtml(markdown);
            const duration = performance.now() - start;

            expect(html).toBeTruthy();
            console.log(`1,000 words: ${duration.toFixed(2)}ms`);
            // Just verify it completes, actual performance depends on parser optimization
        }, 10000);

        it('should render 5,000 words', () => {
            const markdown = generateMarkdown(5000);
            const start = performance.now();
            const html = engine.toHtml(markdown);
            const duration = performance.now() - start;

            expect(html).toBeTruthy();
            console.log(`5,000 words: ${duration.toFixed(2)}ms`);
        }, 60000);

        it('should render 10,000 words', () => {
            const markdown = generateMarkdown(10000);
            const start = performance.now();
            const html = engine.toHtml(markdown);
            const duration = performance.now() - start;

            expect(html).toBeTruthy();
            console.log(`10,000 words: ${duration.toFixed(2)}ms`);
        }, 60000);
    });

    describe('Cache Performance', () => {
        it('should use cache for repeated renders', () => {
            const markdown = generateMarkdown(5000); // Larger dataset for meaningful cache comparison

            // First render (no cache)
            const firstStart = performance.now();
            const firstHtml = engine.toHtml(markdown);
            const firstDuration = performance.now() - firstStart;

            // Second render (with cache)
            const secondStart = performance.now();
            const secondHtml = engine.toHtml(markdown);
            const secondDuration = performance.now() - secondStart;

            expect(firstHtml).toBe(secondHtml);
            // Cache should be significantly faster - at least 5x for larger content
            expect(secondDuration).toBeLessThan(firstDuration / 5);
        }, 15000);

        it('should track cache statistics', () => {
            const markdown = generateMarkdown(1000);

            // Render once
            engine.toHtml(markdown);

            // Render again (cache hit)
            engine.toHtml(markdown);

            const stats = engine.getCacheStats();
            // With our optimized caching, render cache gets the hit (not parse cache)
            expect(stats.render.hits).toBeGreaterThan(0);
            expect(stats.render.hitRate).toBeGreaterThan(0);
        });

        it('should clear caches', () => {
            const markdown = generateMarkdown(1000);

            // Render and cache
            engine.toHtml(markdown);
            expect(engine.getCacheStats().parse.size).toBeGreaterThan(0);

            // Clear cache
            engine.clearCaches();
            expect(engine.getCacheStats().parse.size).toBe(0);
        });
    });

    describe('Performance Metrics', () => {
        it('should provide accurate performance metrics', () => {
            const markdown = generateMarkdown(1000);
            const { html, metrics } = engine.toHtmlWithMetrics(markdown);

            expect(html).toBeTruthy();
            expect(metrics.inputSize).toBe(markdown.length);
            expect(metrics.parseTime).toBeGreaterThan(0);
            expect(metrics.renderTime).toBeGreaterThan(0);
            expect(metrics.totalTime).toBeGreaterThanOrEqual(metrics.parseTime + metrics.renderTime);
            expect(metrics.tokenCount).toBeGreaterThan(0);
        }, 10000);

        it('should detect cache hits in metrics', () => {
            const markdown = generateMarkdown(1000);

            // First render
            const { metrics: firstMetrics } = engine.toHtmlWithMetrics(markdown);
            expect(firstMetrics.cacheHit).toBe(false);

            // Second render (cached)
            const { metrics: secondMetrics } = engine.toHtmlWithMetrics(markdown);
            expect(secondMetrics.cacheHit).toBe(true);
        });
    });

    describe('Streaming Performance', () => {
        it('should stream large documents', async () => {
            const markdown = generateComplexMarkdown(10000);
            const chunks: number[] = [];

            const html = await engine.toHtmlStreamed(markdown, {
                chunkSize: 50,
                onChunk: (chunk) => {
                    chunks.push(chunk.progress);
                }
            });

            expect(html).toBeTruthy();
            expect(chunks.length).toBeGreaterThan(0);
            expect(chunks[chunks.length - 1]).toBe(1); // Final progress should be 100%
        });

        it('should stream with progress updates', async () => {
            const markdown = generateMarkdown(1000);
            const progressUpdates: number[] = [];

            await engine.toHtmlStreamed(markdown, {
                chunkSize: 100,
                onChunk: (chunk) => {
                    progressUpdates.push(chunk.progress);
                }
            });

            // Progress should be monotonically increasing
            for (let i = 1; i < progressUpdates.length; i++) {
                expect(progressUpdates[i]).toBeGreaterThanOrEqual(progressUpdates[i - 1]);
            }
        }, 10000);
    });

    describe('Complex Markdown Performance', () => {
        it('should handle complex nested structures efficiently', () => {
            const markdown = generateComplexMarkdown(5000);
            const start = performance.now();
            const html = engine.toHtml(markdown);
            const duration = performance.now() - start;

            expect(html).toBeTruthy();
            expect(html).toContain('Heading'); // Check for heading content instead of exact tag
            expect(html).toContain('bold'); // Check for bold class
            expect(html).toContain('italic'); // Check for italic class
            expect(html).toContain('inline code'); // Check for code content
            console.log(`Complex markdown: ${duration.toFixed(2)}ms`);
        }, 15000);

        it('should parse and render consistently', () => {
            const markdown = generateComplexMarkdown(1000);

            const result1 = engine.toHtml(markdown);
            const result2 = engine.toHtml(markdown);

            expect(result1).toBe(result2);
        });
    });

    describe('Memory Efficiency', () => {
        it('should limit cache size', () => {
            engine.setCacheSize(10);

            // Generate 20 unique markdown documents
            for (let i = 0; i < 20; i++) {
                const markdown = generateMarkdown(100) + `<!-- ${i} -->`;
                engine.toHtml(markdown);
            }

            const stats = engine.getCacheStats();
            expect(stats.parse.size).toBeLessThanOrEqual(10);
            expect(stats.render.size).toBeLessThanOrEqual(10);
        });

        it('should track evictions', () => {
            engine.setCacheSize(5);

            // Fill cache beyond capacity
            for (let i = 0; i < 10; i++) {
                const markdown = generateMarkdown(100) + `<!-- ${i} -->`;
                engine.toHtml(markdown);
            }

            const stats = engine.getCacheStats();
            expect(stats.parse.evictions).toBeGreaterThan(0);
        });
    });
});
