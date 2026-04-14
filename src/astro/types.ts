import type { EngineConfig, Extension } from '../types';

/**
 * Props for the Astro MarkdownRenderer component.
 */
export interface AstroMarkdownRendererProps {
    /** Markdown content to render */
    content: string;

    /** Output format — 'html' (default) or 'tailwind' */
    format?: 'html' | 'tailwind';

    /** CSS class(es) to add to the wrapper element */
    class?: string;

    /** Engine configuration */
    config?: EngineConfig;

    /** Additional extensions to register */
    extensions?: Extension[];
}
