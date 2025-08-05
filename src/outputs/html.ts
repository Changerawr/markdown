/**
 * Plain HTML output renderer - no CSS framework classes
 */

import { ChangerawrMarkdown } from '../engine';
import type { EngineConfig } from '../types';

/**
 * Render markdown to plain HTML without CSS framework classes
 */
export function renderToHTML(markdown: string, config?: Omit<EngineConfig, 'renderer'>): string {
    const engine = new ChangerawrMarkdown({
        ...config,
        renderer: {
            format: 'html',
            sanitize: true,
            allowUnsafeHtml: false
        }
    });

    return engine.toHtml(markdown);
}

/**
 * Parse markdown and render to HTML with custom configuration
 */
export function renderToHTMLWithConfig(
    markdown: string,
    rendererConfig: { sanitize?: boolean; allowUnsafeHtml?: boolean; debugMode?: boolean }
): string {
    const engine = new ChangerawrMarkdown({
        renderer: {
            format: 'html',
            ...rendererConfig
        }
    });

    return engine.toHtml(markdown);
}

/**
 * Render markdown to HTML without any sanitization (use with caution)
 */
export function renderToHTMLUnsafe(markdown: string): string {
    return renderToHTMLWithConfig(markdown, {
        sanitize: false,
        allowUnsafeHtml: true
    });
}