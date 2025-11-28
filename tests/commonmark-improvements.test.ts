import { describe, it, expect, beforeEach } from 'vitest';
import { ChangerawrMarkdown } from '../src/engine';

describe('Commonmark Improvements', () => {
    let engine: ChangerawrMarkdown;

    beforeEach(() => {
        engine = new ChangerawrMarkdown();
    });

    describe('Ordered Lists', () => {
        it('should parse simple ordered lists', () => {
            const md = `1. First item
2. Second item
3. Third item`;
            const html = engine.toHtml(md);
            expect(html).toContain('<li>First item</li>');
            expect(html).toContain('<li>Second item</li>');
            expect(html).toContain('<li>Third item</li>');
        });

        it('should handle ordered lists with different starting numbers', () => {
            const md = `5. Start at five
6. Six
7. Seven`;
            const html = engine.toHtml(md);
            expect(html).toContain('<li>Start at five</li>');
            expect(html).toContain('<li>Six</li>');
        });

        it('should differentiate between ordered and unordered lists', () => {
            const md = `- Unordered
1. Ordered`;
            const tokens = engine.parse(md);
            const listTypes = tokens.map(t => t.type);
            expect(listTypes).toContain('list-item');
            expect(listTypes).toContain('ordered-list-item');
        });
    });

    describe('Strikethrough', () => {
        it('should parse strikethrough text', () => {
            const md = 'This is ~~deleted~~ text';
            const html = engine.toHtml(md);
            expect(html).toContain('<del');
            expect(html).toContain('deleted');
            expect(html).toContain('</del>');
        });

        it('should handle strikethrough in Tailwind format', () => {
            const md = '~~crossed out~~';
            const html = engine.toHtml(md);
            expect(html).toContain('line-through');
        });

        it('should handle strikethrough with mixed formatting', () => {
            const md = 'This is ~~deleted~~ with **bold** text';
            const html = engine.toHtml(md);
            expect(html).toContain('<del');
            expect(html).toContain('<strong');
        });

        it('should handle multiple strikethrough instances', () => {
            const md = '~~first~~ and ~~second~~';
            const html = engine.toHtml(md);
            const matches = html.match(/<del/g);
            expect(matches?.length).toBe(2);
        });

        it('should not match incomplete strikethrough markers', () => {
            const md = 'This is ~ not strikethrough ~ text';
            const html = engine.toHtml(md);
            expect(html).not.toContain('<del');
        });
    });

    describe('Image Captions', () => {
        it('should render image with caption as figure/figcaption', () => {
            const md = '![alt text](https://example.com/image.png "This is a caption")';
            const html = engine.toHtml(md);
            expect(html).toContain('<figure');
            expect(html).toContain('<figcaption');
            expect(html).toContain('This is a caption');
            expect(html).toContain('alt text');
            expect(html).toContain('https://example.com/image.png');
        });

        it('should render image without caption as simple img tag', () => {
            const md = '![alt text](https://example.com/image.png)';
            const html = engine.toHtml(md);
            expect(html).toContain('<img');
            expect(html).toContain('alt text');
            expect(html).toContain('https://example.com/image.png');
            expect(html).not.toContain('<figure');
        });

        it('should properly escape caption text', () => {
            const md = '![alt](src.png "Caption with <script>alert(1)</script>")';
            const html = engine.toHtml(md);
            expect(html).not.toContain('<script>');
            expect(html).toContain('&lt;');
        });

        it('should include lazy loading attribute', () => {
            const md = '![alt](src.png "caption")';
            const html = engine.toHtml(md);
            expect(html).toContain('loading="lazy"');
        });

        it('should handle image captions in HTML format', () => {
            const engine_html = new ChangerawrMarkdown({
                renderer: { format: 'html' }
            });
            const md = '![alt](src.png "Caption")';
            const html = engine_html.toHtml(md);
            expect(html).toContain('<figcaption');
            expect(html).toContain('style=');
        });
    });

    describe('Task Lists / Checkboxes', () => {
        it('should render checked task items', () => {
            const md = `- [x] Completed task
- [ ] Pending task`;
            const html = engine.toHtml(md);
            expect(html).toContain('task-list-item');
            expect(html).toContain('line-through');
        });

        it('should apply strikethrough to checked items', () => {
            const md = '- [x] Done task';
            const html = engine.toHtml(md);
            expect(html).toContain('line-through');
        });

        it('should handle mixed task list and regular list items', () => {
            const md = `- [x] Task item
- Regular item`;
            const tokens = engine.parse(md);
            const hasTask = tokens.some(t => t.type === 'task-item');
            const hasListItem = tokens.some(t => t.type === 'list-item');
            expect(hasTask).toBe(true);
            expect(hasListItem).toBe(true);
        });

        it('should support uppercase X for completed status', () => {
            const md = '- [X] Uppercase check';
            const html = engine.toHtml(md);
            expect(html).toContain('task-list-item');
            expect(html).toContain('line-through');
        });
    });

    describe('Mixed Content', () => {
        it('should handle ordered lists with formatting', () => {
            const md = `1. First item
2. Second item
3. Third item

**Bold** text outside list`;
            const html = engine.toHtml(md);
            expect(html).toContain('<li>First item</li>');
            expect(html).toContain('<strong');
            expect(html).toContain('Bold</strong>');
        });

        it('should mix strikethrough with other formatting', () => {
            const md = `**Bold** and ~~strikethrough~~
- List with ~~deleted~~ item`;
            const html = engine.toHtml(md);
            expect(html).toContain('<strong');
            expect(html).toContain('<del');
            expect(html).toContain('<li>');
        });

        it('should handle images with captions', () => {
            const md = `1. First item
2. Third item

![alt text](image.png "Image caption")`;
            const html = engine.toHtml(md);
            expect(html).toContain('<li>');
            expect(html).toContain('<figure');
            expect(html).toContain('Image caption');
        });

        it('should combine all features', () => {
            const md = `# Heading
1. First ordered item
2. Second ordered item

- Unordered item
- [x] Done task

![alt](image.png "Caption")

~~Deleted~~ text with **bold**`;
            const html = engine.toHtml(md);
            expect(html).toContain('<h1');
            expect(html).toContain('<li>');
            expect(html).toContain('<figure');
            expect(html).toContain('<del');
            expect(html).toContain('task-list-item');
            expect(html).toContain('<strong');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty ordered lists gracefully', () => {
            const md = `1.
2.`;
            const html = engine.toHtml(md);
            // Should not crash
            expect(html).toBeDefined();
        });

        it('should handle strikethrough with no content', () => {
            const md = '~~~ text';
            const html = engine.toHtml(md);
            expect(html).toBeDefined();
        });

        it('should handle image captions with special characters', () => {
            const md = '![alt](src.png "Caption with: @#$%&*()")';
            const html = engine.toHtml(md);
            expect(html).toContain('figcaption');
            // Should properly escape
            expect(html).toBeDefined();
        });

        it('should not break with malformed list syntax', () => {
            const md = `1 Item without dot
- item without space`;
            const html = engine.toHtml(md);
            expect(html).toBeDefined();
        });

        it('should handle very long ordered list', () => {
            let md = '';
            for (let i = 1; i <= 50; i++) {
                md += `${i}. Item ${i}\n`;
            }
            const html = engine.toHtml(md);
            expect(html.match(/<li>/g)?.length).toBe(50);
        });
    });

    describe('Performance', () => {
        it('should handle large markdown documents efficiently', () => {
            let md = '';
            for (let i = 0; i < 100; i++) {
                md += `${i + 1}. Item ${i + 1} with **bold** and ~~strikethrough~~\n`;
            }
            const start = performance.now();
            const html = engine.toHtml(md);
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(1000); // Should complete within 1 second
            expect(html).toContain('<li>');
        });
    });

    describe('Caching', () => {
        it('should cache parsed ordered lists', () => {
            const md = '1. Item\n2. Item\n3. Item';
            engine.toHtml(md);
            const { metrics } = engine.toHtmlWithMetrics(md);
            expect(metrics.cacheHit).toBe(true);
        });

        it('should cache strikethrough parsing', () => {
            const md = '~~Deleted~~ ~~text~~';
            engine.toHtml(md);
            const { metrics } = engine.toHtmlWithMetrics(md);
            expect(metrics.cacheHit).toBe(true);
        });

        it('should cache image caption rendering', () => {
            const md = '![alt](src.png "caption")';
            engine.toHtml(md);
            const { metrics } = engine.toHtmlWithMetrics(md);
            expect(metrics.cacheHit).toBe(true);
        });
    });
});
