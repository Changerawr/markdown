/**
 * @changerawr/markdown — Astro integration utilities
 *
 * Usage:
 *   import { renderMarkdownForAstro } from '@changerawr/markdown/astro';
 *
 * For the Astro component:
 *   import MarkdownRenderer from '@changerawr/markdown/astro/MarkdownRenderer.astro';
 */

import { ChangerawrMarkdown } from '../engine';
import type { EngineConfig, Extension } from '../types';

export type { AstroMarkdownRendererProps } from './types';

/**
 * Render markdown to an HTML string suitable for Astro's `set:html` directive.
 * Runs entirely server-side — no client JavaScript emitted.
 *
 * @example
 * ---
 * import { renderMarkdownForAstro } from '@changerawr/markdown/astro';
 * const html = renderMarkdownForAstro(Astro.props.content);
 * ---
 * <div set:html={html} />
 */
export function renderMarkdownForAstro(
    content: string,
    options: {
        format?: 'html' | 'tailwind';
        config?: EngineConfig;
        extensions?: Extension[];
    } = {}
): string {
    const { format = 'html', config, extensions } = options;

    const engineConfig: EngineConfig = {
        renderer: {
            sanitize: true,
            ...(config?.renderer ?? {}),
            format
        }
    };
    if (config?.parser) engineConfig.parser = config.parser;

    const engine = new ChangerawrMarkdown(engineConfig);

    if (extensions) {
        extensions.forEach(ext => engine.registerExtension(ext));
    }

    return engine.toHtml(content);
}

// Re-export common utilities so Astro projects only need one import
export { renderToHTML, renderToHTMLWithConfig } from '../outputs/html';
export { renderToTailwind, renderToTailwindWithConfig } from '../outputs/tailwind';
export { ChangerawrMarkdown } from '../engine';
export type { EngineConfig, Extension, MarkdownToken } from '../types';
