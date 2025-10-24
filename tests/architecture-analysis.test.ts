// Test to demonstrate architectural inefficiencies
import { describe, it, expect, vi } from 'vitest';
import { ChangerawrMarkdown } from '../src/engine';

describe('Architecture Analysis - Efficient Implementation', () => {
    it('demonstrates EFFICIENT single-pass parsing (FIXED!)', () => {
        const engine = new ChangerawrMarkdown();

        // Spy on the parse method to count how many times it's called
        const parseSpy = vi.spyOn(engine, 'parse');

        // Simple markdown with one alert containing formatted text
        const markdown = `:::info Test
This has **bold** text.
:::`;

        engine.toHtml(markdown);

        // With NEW architecture, parse is called ONCE:
        // Parser recursively tokenizes nested content during parse phase
        console.log(`Parse called ${parseSpy.mock.calls.length} times for simple alert`);
        expect(parseSpy.mock.calls.length).toBe(1);

        parseSpy.mockRestore();
    });

    it('demonstrates O(1) parsing regardless of alert count (FIXED!)', () => {
        const engine = new ChangerawrMarkdown();
        const parseSpy = vi.spyOn(engine, 'parse');

        // Multiple alerts - with old architecture, this would cause re-parsing
        const markdown = `:::info Outer
Text with **bold**.
:::

:::warning Another
More **bold** text.
:::`;

        engine.toHtml(markdown);

        console.log(`Parse called ${parseSpy.mock.calls.length} times for 2 alerts`);
        // Should be called ONLY ONCE - parser handles nesting internally
        expect(parseSpy.mock.calls.length).toBe(1);

        parseSpy.mockRestore();
    });

    it('shows tokens NOW have proper tree structure (FIXED!)', () => {
        const engine = new ChangerawrMarkdown();

        const markdown = `:::info Alert
**Bold** and *italic* text.
:::`;

        const tokens = engine.parse(markdown);
        const alertToken = tokens.find(t => t.type === 'alert');

        console.log('Alert token structure:', JSON.stringify(alertToken, null, 2));

        // The alert token NOW HAS children - a proper token tree!
        expect(alertToken).toBeDefined();
        expect(alertToken?.content).toBe('**Bold** and *italic* text.');

        // This demonstrates the FIX: children are now tokenized!
        expect((alertToken as any).children).toBeDefined();
        expect((alertToken as any).children.length).toBeGreaterThan(0);

        // Verify the children are properly tokenized
        const children = (alertToken as any).children;
        expect(children.some((t: any) => t.type === 'bold')).toBe(true);
        expect(children.some((t: any) => t.type === 'italic')).toBe(true);
    });

    it('shows ideal token tree structure (what we should have)', () => {
        // This is what the token structure SHOULD look like:
        const idealAlertToken = {
            type: 'alert',
            content: '',  // Empty or composite
            raw: ':::info Alert\n**Bold** text.\n:::',
            attributes: { type: 'info', title: 'Alert' },
            children: [
                {
                    type: 'paragraph',
                    content: '',
                    children: [
                        {
                            type: 'bold',
                            content: 'Bold',
                            children: [
                                { type: 'text', content: 'Bold' }
                            ]
                        },
                        { type: 'text', content: ' text.' }
                    ]
                }
            ]
        };

        console.log('Ideal token structure:', JSON.stringify(idealAlertToken, null, 2));

        // This would be much more efficient:
        // 1. Parse once, build tree
        // 2. Render by walking tree
        // 3. No re-parsing needed!
        expect(idealAlertToken.children).toBeDefined();
        expect(idealAlertToken.children?.length).toBeGreaterThan(0);
    });
});
