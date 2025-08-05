/**
 * Test setup configuration for Vitest
 */

import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend Vitest matchers with custom ones
import { expect } from 'vitest';

// React Testing Library cleanup
afterEach(() => {
    cleanup();
});

// Mock DOMPurify for testing
beforeAll(() => {
    // Mock DOMPurify since it may not be available in test environment
    const mockDOMPurify = {
        sanitize: (html: string) => html // Return HTML as-is for testing
    };

    // Mock the dynamic import
    vi.mock('dompurify', () => ({
        default: mockDOMPurify
    }));
});

// Custom matchers for markdown testing
expect.extend({
    toContainMarkdownElement(received: string, element: string) {
        const pass = received.includes(`<${element}`);
        return {
            pass,
            message: () => pass
                ? `Expected HTML not to contain <${element}> element`
                : `Expected HTML to contain <${element}> element`
        };
    },

    toHaveValidMarkdownStructure(received: string) {
        // Basic HTML structure validation
        const hasOpeningTags = /<\w+/.test(received);
        const hasClosingTags = /<\/\w+>/.test(received);
        const pass = hasOpeningTags && hasClosingTags;

        return {
            pass,
            message: () => pass
                ? 'Expected HTML to have invalid markdown structure'
                : 'Expected HTML to have valid markdown structure with opening and closing tags'
        };
    },

    toBeValidHTML(received: string) {
        // Simple HTML validation - checks for basic tag matching
        const openTags = received.match(/<(\w+)[^>]*>/g) || [];
        const closeTags = received.match(/<\/(\w+)>/g) || [];
        const selfClosingTags = received.match(/<(\w+)[^>]*\/>/g) || [];

        // Extract tag names
        const openTagNames = openTags.map(tag => tag.match(/<(\w+)/)?.[1]).filter(Boolean);
        const closeTagNames = closeTags.map(tag => tag.match(/<\/(\w+)>/)?.[1]).filter(Boolean);
        const selfClosingTagNames = selfClosingTags.map(tag => tag.match(/<(\w+)/)?.[1]).filter(Boolean);

        // Filter out self-closing tags from open tags
        const nonSelfClosingOpenTags = openTagNames.filter(tag =>
            !selfClosingTagNames.includes(tag!) &&
            !['br', 'hr', 'img', 'input'].includes(tag!)
        );

        const pass = nonSelfClosingOpenTags.length === closeTagNames.length;

        return {
            pass,
            message: () => pass
                ? 'Expected HTML to be invalid'
                : `Expected HTML to be valid. Open tags: ${nonSelfClosingOpenTags.length}, Close tags: ${closeTagNames.length}`
        };
    }
});

// Declare custom matchers for TypeScript
declare module 'vitest' {
    interface Assertion<T = any> {
        toContainMarkdownElement(element: string): T;
        toHaveValidMarkdownStructure(): T;
        toBeValidHTML(): T;
    }
}