// Test to reproduce the alert rendering bug
import { describe, it, expect, beforeEach } from 'vitest';
import { ChangerawrMarkdown } from '../src/engine';

describe('Alert Bug Reproduction', () => {
    let engine: ChangerawrMarkdown;

    beforeEach(() => {
        engine = new ChangerawrMarkdown();
    });

    it('should render markdown formatting inside alert content', () => {
        const markdown = `:::info First Alert
This is **bold** text and this is *italic* text.
Here is a [link](https://example.com) too.
:::`;

        const html = engine.toHtml(markdown);
        console.log('HTML output:', html);

        // These should pass if markdown is being rendered correctly
        expect(html).toContain('<strong');
        expect(html).toContain('bold</strong>');
        expect(html).toContain('<em');
        expect(html).toContain('italic</em>');
        expect(html).toContain('<a');
        expect(html).toContain('href="https://example.com"');

        // These should NOT be in the output
        expect(html).not.toContain('**bold**');
        expect(html).not.toContain('*italic*');
        expect(html).not.toContain('[link]');
    });

    it('should handle multiple alerts with markdown content', () => {
        const markdown = `:::warning First
**Bold** in first alert
:::

Some text between.

:::info Second
*Italic* in second alert
:::`;

        const html = engine.toHtml(markdown);
        console.log('Multiple alerts HTML:', html);

        expect(html).toContain('<strong');
        expect(html).toContain('Bold</strong>');
        expect(html).toContain('<em');
        expect(html).toContain('Italic</em>');
    });

    it('should render lists inside alerts', () => {
        const markdown = `:::info Alert with List
Here are items:
- Item 1
- Item 2
- Item 3
:::`;

        const html = engine.toHtml(markdown);
        console.log('Alert with list HTML:', html);

        // Should have list item markup
        expect(html).toContain('<li');
        expect(html).toContain('Item 1');
        expect(html).toContain('Item 2');
        expect(html).toContain('Item 3');
    });

    it('should render code inside alerts', () => {
        const markdown = `:::tip Code Example
Use the \`console.log()\` function to debug.
:::`;

        const html = engine.toHtml(markdown);
        console.log('Alert with code HTML:', html);

        expect(html).toContain('<code');
        expect(html).toContain('console.log()');
        expect(html).not.toContain('`console.log()`');
    });
});
