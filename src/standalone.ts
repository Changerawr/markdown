/**
 * Standalone version of Changerawr Markdown for vanilla JavaScript usage
 * No React dependencies - works in browser and Node.js environments
 */

import { ChangerawrMarkdown, parseMarkdown, renderMarkdown } from './engine';
import type { MarkdownToken, Extension, EngineConfig } from './types';

// Main renderCum function for vanilla JS usage
export function renderCum(markdown: string, config?: EngineConfig): string {
    const engine = new ChangerawrMarkdown(config);
    return engine.toHtml(markdown);
}

// Parse-only function for getting tokens
export function parseCum(markdown: string, config?: EngineConfig): MarkdownToken[] {
    const engine = new ChangerawrMarkdown(config);
    return engine.parse(markdown);
}

// Create a custom engine instance
export function createCumEngine(config?: EngineConfig): ChangerawrMarkdown {
    return new ChangerawrMarkdown(config);
}

// Convenience functions with different output formats
export function renderCumToHtml(markdown: string): string {
    return renderCum(markdown, {
        renderer: { format: 'html' }
    });
}

export function renderCumToTailwind(markdown: string): string {
    return renderCum(markdown, {
        renderer: { format: 'tailwind' }
    });
}

export function renderCumToJson(markdown: string): MarkdownToken[] {
    return parseCum(markdown);
}

// Global API for browser usage
if (typeof window !== 'undefined') {
    // Browser environment - attach to window
    (window as any).ChangerawrMarkdown = {
        renderCum,
        parseCum,
        createCumEngine,
        renderCumToHtml,
        renderCumToTailwind,
        renderCumToJson,
        // Legacy aliases
        render: renderCum,
        parse: parseCum
    };
}

// Node.js environment exports
export {
    ChangerawrMarkdown,
    parseMarkdown,
    renderMarkdown,
    type MarkdownToken,
    type Extension,
    type EngineConfig
};

// Default export for easier imports
export default {
    renderCum,
    parseCum,
    createCumEngine,
    renderCumToHtml,
    renderCumToTailwind,
    renderCumToJson,
    ChangerawrMarkdown,
    parseMarkdown,
    renderMarkdown
};