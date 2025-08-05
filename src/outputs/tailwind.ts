/**
 * Tailwind CSS output renderer - HTML with Tailwind CSS classes
 */

import { ChangerawrMarkdown } from '../engine';
import type { EngineConfig } from '../types';

/**
 * Render markdown to HTML with Tailwind CSS classes (default behavior)
 */
export function renderToTailwind(markdown: string, config?: Omit<EngineConfig, 'renderer'>): string {
    const engine = new ChangerawrMarkdown({
        ...config,
        renderer: {
            format: 'tailwind',
            sanitize: true,
            allowUnsafeHtml: false
        }
    });

    return engine.toHtml(markdown);
}

/**
 * Render markdown with custom Tailwind classes
 */
export function renderToTailwindWithClasses(
    markdown: string,
    customClasses?: Record<string, string>
): string {
    const engine = new ChangerawrMarkdown({
        renderer: {
            format: 'tailwind',
            ...(customClasses && { customClasses })
        }
    });

    return engine.toHtml(markdown);
}

/**
 * Render markdown to Tailwind HTML with custom configuration
 */
export function renderToTailwindWithConfig(
    markdown: string,
    rendererConfig: {
        sanitize?: boolean;
        allowUnsafeHtml?: boolean;
        customClasses?: Record<string, string>;
        debugMode?: boolean;
    }
): string {
    const engine = new ChangerawrMarkdown({
        renderer: {
            format: 'tailwind',
            ...rendererConfig
        }
    });

    return engine.toHtml(markdown);
}

/**
 * Default Tailwind configuration for common use cases
 */
export const defaultTailwindClasses = {
    // Typography
    'heading-1': 'text-3xl font-bold mt-8 mb-4',
    'heading-2': 'text-2xl font-semibold mt-6 mb-3',
    'heading-3': 'text-xl font-medium mt-5 mb-3',
    'heading-4': 'text-lg font-medium mt-4 mb-2',
    'heading-5': 'text-base font-medium mt-3 mb-2',
    'heading-6': 'text-sm font-medium mt-3 mb-2',
    'paragraph': 'leading-7 mb-4',
    'blockquote': 'pl-4 py-2 border-l-2 border-border italic text-muted-foreground my-4',

    // Code
    'code-inline': 'bg-muted px-1.5 py-0.5 rounded text-sm font-mono',
    'code-block': 'bg-muted p-4 rounded-md overflow-x-auto my-4',

    // Links and buttons
    'link': 'text-primary hover:underline inline-flex items-center gap-1',
    'button': 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',

    // Lists
    'list': 'list-disc list-inside space-y-1',
    'list-item': 'ml-4',

    // Images and media
    'image': 'max-w-full h-auto rounded-lg my-4',
    'embed': 'rounded-lg border bg-card text-card-foreground shadow-sm mb-6 overflow-hidden',

    // Alerts
    'alert': 'border-l-4 p-4 mb-4 rounded-md transition-colors duration-200',
    'alert-info': 'bg-blue-500/10 border-blue-500/30 text-blue-600 border-l-blue-500',
    'alert-warning': 'bg-amber-500/10 border-amber-500/30 text-amber-600 border-l-amber-500',
    'alert-error': 'bg-red-500/10 border-red-500/30 text-red-600 border-l-red-500',
    'alert-success': 'bg-green-500/10 border-green-500/30 text-green-600 border-l-green-500'
};

/**
 * Prose-friendly Tailwind classes for blog/article content
 */
export const proseClasses = {
    'heading-1': 'text-4xl font-bold tracking-tight mt-10 mb-6',
    'heading-2': 'text-3xl font-semibold tracking-tight mt-8 mb-4',
    'heading-3': 'text-2xl font-medium tracking-tight mt-6 mb-3',
    'paragraph': 'text-lg leading-8 mb-6',
    'blockquote': 'border-l-4 border-gray-300 pl-6 py-2 italic text-gray-700 my-6',
    'code-inline': 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono',
    'code-block': 'bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-6 text-sm',
    'link': 'text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2'
};

/**
 * Minimal Tailwind classes for clean, simple styling
 */
export const minimalClasses = {
    'heading-1': 'text-2xl font-semibold mb-4',
    'heading-2': 'text-xl font-medium mb-3',
    'heading-3': 'text-lg font-medium mb-2',
    'paragraph': 'mb-4',
    'blockquote': 'border-l-2 border-gray-300 pl-4 italic mb-4',
    'code-inline': 'bg-gray-100 px-1 rounded font-mono text-sm',
    'code-block': 'bg-gray-100 p-3 rounded font-mono text-sm mb-4',
    'link': 'text-blue-600 hover:underline'
};