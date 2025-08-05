/**
 * Standalone version of Changerawr Markdown for vanilla JavaScript usage
 * No React dependencies - works in browser and Node.js environments
 */

import { ChangerawrMarkdown } from './engine';
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

// Create the global API object
const globalAPI = {
    renderCum,
    parseCum,
    createCumEngine,
    renderCumToHtml,
    renderCumToTailwind,
    renderCumToJson,
    // Legacy aliases
    render: renderCum,
    parse: parseCum,
    // Include the main class
    ChangerawrMarkdown
};

// Export for Node.js/module usage
export {
    ChangerawrMarkdown,
    type MarkdownToken,
    type Extension,
    type EngineConfig
};

// Default export for easier imports
export default globalAPI;

// Browser global assignment (will be executed when the script loads)
if (typeof window !== 'undefined') {
    (window as any).ChangerawrMarkdown = globalAPI;
}

// Also assign to global scope for different environments
if (typeof globalThis !== 'undefined') {
    (globalThis as any).ChangerawrMarkdown = globalAPI;
}