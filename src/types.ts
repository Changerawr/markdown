// Core markdown token interface
export interface MarkdownToken {
    type: string;
    content: string;
    raw: string;
    attributes?: Record<string, string | number | boolean | Function | any>;
    children?: MarkdownToken[];  // Support for nested token tree structure
}

// Parser rule for converting markdown to tokens
export interface ParseRule {
    name: string;
    pattern: RegExp;
    render: (match: RegExpMatchArray) => MarkdownToken;
}

// Render rule for converting tokens to output format
export interface RenderRule {
    type: string;
    render: (token: MarkdownToken) => string;
}

// Extension interface for adding custom functionality
export interface Extension {
    name: string;
    parseRules: ParseRule[];
    renderRules: RenderRule[];
}

// ---- Component Extension System ----

/**
 * Props passed to a framework component registered on a ComponentRenderRule.
 * The `children` type is intentionally `unknown` here — each framework binding
 * (React, Astro, etc.) narrows it to the correct type in its own module.
 */
export interface ComponentTokenProps {
    token: MarkdownToken;
    /** Pre-rendered children (framework-specific ReactNode, Astro.slots, etc.) */
    children?: unknown;
}

/**
 * A render rule that optionally carries a framework component.
 * The `render` function is always required as a string-output fallback used by
 * HTML / Tailwind / JSON / Astro outputs.  Framework renderers (React, etc.)
 * will prefer `component` when present.
 */
export interface ComponentRenderRule extends RenderRule {
    /**
     * Framework component (React.ComponentType, Svelte component, etc.).
     * Typed as `unknown` here; each framework module provides a narrowed variant.
     */
    component?: unknown;
}

/**
 * An Extension that may carry framework components on its render rules.
 * It is fully compatible with the base `Extension` type and can be registered
 * with the engine like any regular extension — the engine only uses `render`.
 */
export interface ComponentExtension extends Extension {
    renderRules: ComponentRenderRule[];
}

// Output format types
export type OutputFormat = 'html' | 'tailwind' | 'json';

// Renderer configuration options
export interface RendererConfig {
    format: OutputFormat;
    sanitize?: boolean;
    allowUnsafeHtml?: boolean;
    customClasses?: Record<string, string>;
    debugMode?: boolean;
}

// Parser configuration options
export interface ParserConfig {
    debugMode?: boolean;
    maxIterations?: number;
    validateMarkdown?: boolean;
}

// Main engine configuration
export interface EngineConfig {
    parser?: ParserConfig;
    renderer?: RendererConfig;
    extensions?: Extension[];
}

// Debug information interface
export interface DebugInfo {
    warnings: string[];
    parseTime: number;
    renderTime: number;
    tokenCount: number;
    iterationCount: number;
}

// JSON AST output interface
export interface JsonAstNode {
    type: string;
    content: string;
    attributes?: Record<string, string>;
    children?: JsonAstNode[];
}

// Performance metrics
export interface PerformanceMetrics {
    parseTime: number;
    renderTime: number;
    totalTime: number;
    tokenCount: number;
    memoryUsed?: number;
}

// Error types
export class MarkdownParseError extends Error {
    constructor(
        message: string,
        public readonly position?: number,
        public readonly rule?: string
    ) {
        super(message);
        this.name = 'MarkdownParseError';
    }
}

export class MarkdownRenderError extends Error {
    constructor(
        message: string,
        public readonly tokenType?: string,
        public readonly token?: MarkdownToken
    ) {
        super(message);
        this.name = 'MarkdownRenderError';
    }
}

export class ExtensionError extends Error {
    constructor(
        message: string,
        public readonly extensionName?: string
    ) {
        super(message);
        this.name = 'ExtensionError';
    }
}

// Utility types for better TypeScript support
export type TokenType =
    | 'text'
    | 'heading'
    | 'bold'
    | 'italic'
    | 'code'
    | 'codeblock'
    | 'link'
    | 'image'
    | 'list-item'
    | 'task-item'
    | 'blockquote'
    | 'hr'
    | 'line-break'
    | 'paragraph-break'
    | 'soft-break'
    | 'paragraph'
    // Extension types
    | 'alert'
    | 'button'
    | 'embed'
    // Custom types
    | string;

// Event handlers for the engine
export interface EngineEvents {
    onParseStart?: (content: string) => void;
    onParseComplete?: (tokens: MarkdownToken[], metrics: PerformanceMetrics) => void;
    onRenderStart?: (tokens: MarkdownToken[]) => void;
    onRenderComplete?: (html: string, metrics: PerformanceMetrics) => void;
    onError?: (error: Error) => void;
    onWarning?: (warning: string) => void;
}

// Extension registration result
export interface ExtensionRegistration {
    success: boolean;
    extensionName: string;
    error?: string;
    conflictingRules?: string[];
}