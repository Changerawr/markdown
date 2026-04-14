import React, { ReactNode } from 'react';
import {DebugInfo, EngineConfig, Extension, MarkdownToken, OutputFormat, PerformanceMetrics } from '../types';

// Re-export core types from the main types file
export type {
    MarkdownToken,
    Extension,
    OutputFormat,
    EngineConfig,
    RendererConfig,
    ParserConfig,
    DebugInfo,
    PerformanceMetrics,
    ComponentTokenProps,
    ComponentRenderRule,
    ComponentExtension
} from '../types';

// ---- React-specific component extension types ----

/**
 * Props passed to a React component registered on a ReactComponentRenderRule.
 */
export interface ReactComponentTokenProps {
    token: MarkdownToken;
    /** Rendered children as React nodes (nil when the token has no children) */
    children?: React.ReactNode;
}

/**
 * A render rule that optionally carries a React component.
 */
export interface ReactComponentRenderRule {
    type: string;
    /** React component used by the React renderer when present. */
    component?: React.ComponentType<ReactComponentTokenProps>;
    /** String fallback — used by HTML / Tailwind / Astro renderers. */
    render: (token: MarkdownToken) => string;
}

/**
 * A ComponentExtension with React components attached to its render rules.
 * Compatible with the base Extension interface — pass directly to createEngine().
 */
export interface ReactComponentExtension {
    name: string;
    parseRules: import('../types').ParseRule[];
    renderRules: ReactComponentRenderRule[];
}

/**
 * Props for the MarkdownRenderer component
 */
export interface MarkdownRendererProps {
    /** Markdown content to render */
    content: string;

    /** Additional CSS classes to apply to the wrapper */
    className?: string;

    /** Engine configuration */
    config?: EngineConfig;

    /** Output format (defaults to 'tailwind') */
    format?: OutputFormat;

    /** Custom wrapper element (defaults to 'div') */
    as?: keyof JSX.IntrinsicElements;

    /** Additional HTML attributes for the wrapper */
    wrapperProps?: React.HTMLAttributes<HTMLElement>;

    /** Enable debug mode */
    debug?: boolean;

    /** Custom error fallback component */
    errorFallback?: (error: Error) => ReactNode;

    /** Loading component while processing */
    loading?: ReactNode;

    /** Callback when rendering completes */
    onRender?: (html: string, tokens: MarkdownToken[]) => void;

    /** Callback when an error occurs */
    onError?: (error: Error) => void;

    /** Custom extensions to register */
    extensions?: Extension[];

    /**
     * Component extensions — extensions whose render rules carry React components.
     * When provided the renderer switches from dangerouslySetInnerHTML to a React
     * element tree, giving component-rendered tokens full React lifecycle support.
     */
    componentExtensions?: ReactComponentExtension[];

    /** Whether to sanitize HTML output */
    sanitize?: boolean;

    /** Allow unsafe HTML (use with caution) */
    allowUnsafeHtml?: boolean;
}

/**
 * Options for useMarkdown hook
 */
export interface UseMarkdownOptions {
    /** Engine configuration */
    config?: EngineConfig;

    /** Output format */
    format?: OutputFormat;

    /** Enable debug mode */
    debug?: boolean;

    /** Custom extensions */
    extensions?: Extension[];

    /** Component extensions (React-component-bearing extensions) */
    componentExtensions?: ReactComponentExtension[];

    /** Debounce delay in milliseconds */
    debounceMs?: number;

    /** Whether to memoize results */
    memoize?: boolean;
}

/**
 * Return type for useMarkdown hook
 */
export interface UseMarkdownResult {
    /** Rendered HTML */
    html: string;

    /** Parsed tokens */
    tokens: MarkdownToken[];

    /** Loading state */
    isLoading: boolean;

    /** Error state */
    error: Error | null;

    /** Debug information */
    debug: MarkdownDebugInfo | null;

    /** Re-render with new content */
    render: (content: string) => void;

    /** Clear current state */
    clear: () => void;

    /**
     * Render an arbitrary batch of tokens to an HTML string using the current engine.
     * Used internally by TokenTreeRenderer to render non-component token groups.
     */
    renderBatch: (tokens: MarkdownToken[]) => string;
}

/**
 * Options for useMarkdownEngine hook
 */
export interface MarkdownEngineHookOptions {
    /** Initial engine configuration */
    config?: EngineConfig;

    /** Auto-register built-in extensions */
    autoRegisterExtensions?: boolean;
}

/**
 * Debug information for React components - extends the core DebugInfo
 */
export interface MarkdownDebugInfo {
    /** Core debug info from engine */
    core: DebugInfo | null;

    /** Performance metrics */
    performance: PerformanceMetrics | null;

    /** Render timestamp */
    renderedAt: Date;

    /** Input content length */
    contentLength: number;

    /** Output HTML length */
    htmlLength: number;

    /** Extensions used */
    extensionsUsed: string[];
}