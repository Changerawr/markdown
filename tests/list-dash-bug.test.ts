/**
 * Test for list item with dash in content bug
 * Issue: When a list item contains bold text followed by a dash,
 * the markdown parser incorrectly splits it into multiple list items
 *
 * Expected behavior:
 * - **Data Importing** - You can now import...
 * Should render as a SINGLE list item with bold and regular text
 *
 * Current buggy behavior:
 * Renders as TWO list items:
 * - **Data Importing**
 * - You can now import...
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChangerawrMarkdown } from '../src/engine';

describe('List Items with Dash in Content Bug', () => {
    let markdown: ChangerawrMarkdown;

    beforeEach(() => {
        markdown = new ChangerawrMarkdown();
    });

    it('should handle bold text followed by dash in list item', () => {
        const input = '- **Data Importing** - You can now import data from various sources to jump-start your Changerawr project!';

        const tokens = markdown.parser.parse(input);
        const listItems = tokens.filter(t => t.type === 'list-item');

        // Should be 1 list item, not 2
        expect(listItems).toHaveLength(1);
        expect(listItems[0]?.content).toContain('**Data Importing**');
        expect(listItems[0]?.content).toContain('You can now import');
    });

    it('should render list item with dash as single element', () => {
        const input = '- **Data Importing** - You can now import data from various sources to jump-start your Changerawr project!';
        const html = markdown.parse(input);

        // Debug output to see what we're actually getting
        console.log('HTML output:', html);

        // Should contain one <li> element, not two
        if (typeof html === 'string') {
            const liCount = (html.match(/<li>/g) || []).length;
            expect(liCount).toBe(1);

            // Should have the bold text within the single list item
            expect(html).toContain('<strong');
            expect(html).toContain('You can now import');
        }
    });

    it('should handle multiple list items where some have dashes in content', () => {
        const input = `- **Feature One** - This is the first feature
- **Feature Two** - This is the second feature
- Simple item without dash`;

        const tokens = markdown.parser.parse(input);
        const listItems = tokens.filter(t => t.type === 'list-item');

        // Should be exactly 3 list items
        expect(listItems).toHaveLength(3);
        expect(listItems[0]?.content).toContain('**Feature One**');
        expect(listItems[0]?.content).toContain('This is the first feature');
        expect(listItems[1]?.content).toContain('**Feature Two**');
        expect(listItems[2]?.content).toBe('Simple item without dash');
    });

    it('should handle bold with multiple dashes in content', () => {
        const input = '- **Bold Text** - middle dash - end dash';

        const tokens = markdown.parser.parse(input);
        const listItems = tokens.filter(t => t.type === 'list-item');

        // Should be 1 list item
        expect(listItems).toHaveLength(1);
        // Should contain the bold text and all dashes
        expect(listItems[0]?.content).toBe('**Bold Text** - middle dash - end dash');
    });

    it('should handle italic text followed by dash', () => {
        const input = '- *Italic Text* - Some description here';

        const tokens = markdown.parser.parse(input);
        const listItems = tokens.filter(t => t.type === 'list-item');

        expect(listItems).toHaveLength(1);
        expect(listItems[0]?.content).toContain('*Italic Text*');
        expect(listItems[0]?.content).toContain('Some description here');
    });
});
