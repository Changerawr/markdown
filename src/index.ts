/**
 * @changerawr/markdown - Main package exports
 *
 * Powerful markdown renderer with custom extensions
 * Supports HTML, Tailwind CSS, and JSON outputs
 */

import { ChangerawrMarkdown, parseMarkdown, renderMarkdown } from './engine';
import { AlertExtension, ButtonExtension, EmbedExtension } from './extensions';
import { renderToHTML } from './outputs/html';
import { renderToTailwind } from './outputs/tailwind';
import { renderToJSON, renderToAST } from './outputs/json';
import type { EngineConfig, Extension } from './types';
import {
    escapeHtml,
    generateId,
    sanitizeHtml,
    extractDomain,
    parseOptions,
    PerformanceTimer,
    Logger
} from './utils';

// ========================================
// CORE ENGINE AND CLASSES
// ========================================

export {
    ChangerawrMarkdown,
    parseMarkdown,
    renderMarkdown
} from './engine';

export { MarkdownParser } from './parser';
export { MarkdownRenderer } from './renderer';

// ========================================
// TYPE DEFINITIONS
// ========================================

// Core markdown types
export type {
    MarkdownToken,
    ParseRule,
    RenderRule,
    Extension,
    TokenType
} from './types';

// Configuration types
export type {
    EngineConfig,
    ParserConfig,
    RendererConfig,
    OutputFormat
} from './types';

// Debug and performance types
export type {
    DebugInfo,
    PerformanceMetrics,
    EngineEvents,
    ExtensionRegistration
} from './types';

// JSON AST types
export type {
    JsonAstNode
} from './types';

// Error types
export type {
    MarkdownParseError,
    MarkdownRenderError,
    ExtensionError
} from './types';

// ========================================
// BUILT-IN EXTENSIONS
// ========================================

export {
    AlertExtension,
    ButtonExtension,
    EmbedExtension
} from './extensions';

// Re-export extension types for convenience
export type { Extension as ExtensionInterface } from './types';

// ========================================
// OUTPUT FORMATS
// ========================================

// HTML Output
export {
    renderToHTML,
    renderToHTMLWithConfig,
    renderToHTMLUnsafe
} from './outputs/html';

// Tailwind CSS Output
export {
    renderToTailwind,
    renderToTailwindWithClasses,
    renderToTailwindWithConfig
} from './outputs/tailwind';

// JSON Output
export {
    renderToJSON,
    renderToAST
} from './outputs/json';

// ========================================
// UTILITIES
// ========================================

// HTML and text utilities
export {
    escapeHtml,
    generateId,
    sanitizeHtml,
    extractDomain,
    parseOptions,
    PerformanceTimer,
    Logger
} from './utils';

// ========================================
// CONVENIENCE FACTORY FUNCTIONS
// ========================================

/**
 * Create a general-purpose markdown engine with default settings
 */
export function createEngine(config?: EngineConfig): ChangerawrMarkdown {
    return new ChangerawrMarkdown(config);
}

/**
 * Create an engine optimized for HTML output (no CSS classes)
 */
export function createHTMLEngine(config?: Omit<EngineConfig, 'renderer'>): ChangerawrMarkdown {
    return new ChangerawrMarkdown({
        ...config,
        renderer: {
            format: 'html',
            sanitize: true,
            allowUnsafeHtml: false
        }
    });
}

/**
 * Create an engine optimized for Tailwind CSS output
 */
export function createTailwindEngine(config?: Omit<EngineConfig, 'renderer'>): ChangerawrMarkdown {
    return new ChangerawrMarkdown({
        ...config,
        renderer: {
            format: 'tailwind',
            sanitize: true,
            allowUnsafeHtml: false
        }
    });
}

/**
 * Create an engine with debug mode enabled
 */
export function createDebugEngine(config?: EngineConfig): ChangerawrMarkdown {
    return new ChangerawrMarkdown({
        ...config,
        parser: {
            debugMode: true,
            validateMarkdown: true,
            ...config?.parser
        },
        renderer: {
            format: 'tailwind',
            debugMode: true,
            ...config?.renderer
        }
    });
}

/**
 * Create an engine without built-in extensions (minimal setup)
 */
export function createMinimalEngine(config?: EngineConfig): ChangerawrMarkdown {
    const engine = new ChangerawrMarkdown({
        ...config,
        extensions: [] // Override to prevent built-in extensions
    });

    // Manually remove built-in extensions if they were added
    if (engine.hasExtension('alert')) {
        engine.unregisterExtension('alert');
    }
    if (engine.hasExtension('button')) {
        engine.unregisterExtension('button');
    }
    if (engine.hasExtension('embed')) {
        engine.unregisterExtension('embed');
    }

    return engine;
}

/**
 * Create an engine with custom extensions only
 */
export function createCustomEngine(extensions: Extension[], config?: Omit<EngineConfig, 'extensions'>): ChangerawrMarkdown {
    return new ChangerawrMarkdown({
        ...config,
        extensions
    });
}

// ========================================
// QUICK ACCESS API
// ========================================

/**
 * Quick access object with common functions
 * Useful for destructuring: const { render, parse, toHtml } = markdown;
 */
export const markdown = {
    // Core rendering functions
    render: renderMarkdown,
    parse: parseMarkdown,

    // Output format functions
    toHtml: renderToHTML,
    toTailwind: renderToTailwind,
    toJson: renderToJSON,
    toAst: renderToAST,

    // Engine creation
    createEngine,
    createHTMLEngine,
    createTailwindEngine,
    createDebugEngine,
    createMinimalEngine,
    createCustomEngine,

    // Main class
    ChangerawrMarkdown,

    // Extensions
    extensions: {
        Alert: AlertExtension,
        Button: ButtonExtension,
        Embed: EmbedExtension
    },

    // Utilities
    utils: {
        escapeHtml,
        generateId,
        sanitizeHtml,
        extractDomain,
        parseOptions,
        PerformanceTimer,
        Logger
    }
} as const;

// ========================================
// DEFAULT EXPORT
// ========================================

/**
 * Default export provides the quick access API
 * Usage: import markdown from '@changerawr/markdown'
 */
export default markdown;