/**
 * @changerawr/markdown - Main package exports
 *
 * Powerful markdown renderer with custom extensions
 * Supports HTML, Tailwind CSS, and JSON outputs
 */

import { ChangerawrMarkdown, parseMarkdown, renderMarkdown } from './engine';
import {BlockquoteExtension, BoldExtension,
    CodeBlockExtension, CoreExtensions, HeadingExtension,
    HorizontalRuleExtension, ImageExtension, InlineCodeExtension, ItalicExtension,
    LineBreakExtension,
    LinkExtension, ListExtension, ParagraphExtension, TaskListExtension, TextExtension } from './extensions/core';
import { AlertExtension, ButtonExtension, EmbedExtension } from './extensions';
import { renderToHTML } from './outputs/html';
import { renderToAST, renderToJSON } from './outputs/json';
import { renderToTailwind } from './outputs/tailwind';
import { parseCum, renderCum } from './standalone';
import type { EngineConfig, Extension } from './types';
import { escapeHtml, extractDomain, generateId, Logger, parseOptions, PerformanceTimer, sanitizeHtml } from "./utils";

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
// CORE EXTENSIONS (NEW!)
// ========================================

export {
    CoreExtensions,
    TextExtension,
    HeadingExtension,
    BoldExtension,
    ItalicExtension,
    InlineCodeExtension,
    CodeBlockExtension,
    LinkExtension,
    ImageExtension,
    ListExtension,
    TaskListExtension,
    BlockquoteExtension,
    HorizontalRuleExtension,
    ParagraphExtension,
    LineBreakExtension
} from './extensions/core';

// ========================================
// FEATURE EXTENSIONS
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
    renderToTailwindWithConfig,
    defaultTailwindClasses,
    proseClasses,
    minimalClasses
} from './outputs/tailwind';

// JSON Output
export {
    renderToJSON,
    renderToAST,
    tokensToAST,
    astToTokens,
    tokensToJSONString,
    astToJSONString,
    parseTokensFromJSON,
    parseASTFromJSON,
    getTokenStats,
    getASTStats,
    compareTokens
} from './outputs/json';

// JSON Output Types
export type {
    TokenStatistics,
    ASTStatistics,
    TokenDifference,
    TokenComparison
} from './outputs/json';

// ========================================
// UTILITIES
// ========================================

// HTML and text utilities
export {
    escapeHtml,
    generateId,
    sanitizeHtml,
    basicSanitize
} from './utils';

// Environment detection
export {
    isBrowser,
    isNode
} from './utils';

// Functional utilities
export {
    debounce,
    deepMerge,
    parseOptions
} from './utils';

// URL utilities
export {
    extractDomain,
    isValidUrl
} from './utils';

// Debug and performance utilities
export {
    PerformanceTimer,
    Logger
} from './utils';

// ========================================
// STANDALONE SUPPORT
// ========================================

// Vanilla JS functions (no React dependency)
export {
    renderCum,
    parseCum,
    createCumEngine,
    renderCumToHtml,
    renderCumToTailwind,
    renderCumToJson
} from './standalone';

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
 * Create an engine with only specified extensions (minimal setup)
 */
export function createMinimalEngine(extensions: Extension[] = []): ChangerawrMarkdown {
    const engine = new ChangerawrMarkdown();

    // Clear all default extensions
    const defaultExtensions = engine.getExtensions();
    defaultExtensions.forEach(ext => engine.unregisterExtension(ext));

    // Only add the ones specified
    extensions.forEach(ext => engine.registerExtension(ext));

    return engine;
}

/**
 * Create an engine with only core markdown extensions (no custom features)
 */
export function createCoreOnlyEngine(config?: EngineConfig): ChangerawrMarkdown {
    const engine = new ChangerawrMarkdown(config);

    // Remove feature extensions, keep core
    engine.unregisterExtension('alert');
    engine.unregisterExtension('button');
    engine.unregisterExtension('embed');

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
    createCoreOnlyEngine,
    createCustomEngine,

    // Standalone functions
    renderCum,
    parseCum,

    // Main class
    ChangerawrMarkdown,

    // Extensions
    extensions: {
        // All core extensions as a bundle
        core: CoreExtensions,

        // Individual core extensions
        Text: TextExtension,
        Heading: HeadingExtension,
        Bold: BoldExtension,
        Italic: ItalicExtension,
        InlineCode: InlineCodeExtension,
        CodeBlock: CodeBlockExtension,
        Link: LinkExtension,
        Image: ImageExtension,
        List: ListExtension,
        TaskList: TaskListExtension,
        Blockquote: BlockquoteExtension,
        HorizontalRule: HorizontalRuleExtension,
        Paragraph: ParagraphExtension,
        LineBreak: LineBreakExtension,

        // Feature extensions
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

// ========================================
// PRESET CONFIGURATIONS
// ========================================

/**
 * Preset configurations for common use cases
 */
export const presets = {
    /**
     * Blog/article preset with prose-friendly styling
     */
    blog: {
        renderer: {
            format: 'tailwind' as const,
            customClasses: {
                'heading-1': 'text-4xl font-bold tracking-tight mt-10 mb-6',
                'heading-2': 'text-3xl font-semibold tracking-tight mt-8 mb-4',
                'heading-3': 'text-2xl font-medium tracking-tight mt-6 mb-3',
                'paragraph': 'text-lg leading-8 mb-6',
                'blockquote': 'border-l-4 border-gray-300 pl-6 py-2 italic text-gray-700 my-6',
                'code-inline': 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono',
                'code-block': 'bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-6 text-sm'
            }
        }
    },

    /**
     * Documentation preset with clean, technical styling
     */
    docs: {
        renderer: {
            format: 'tailwind' as const,
            customClasses: {
                'heading-1': 'text-3xl font-bold border-b border-gray-200 pb-2 mb-6',
                'heading-2': 'text-2xl font-semibold mt-8 mb-4',
                'heading-3': 'text-xl font-medium mt-6 mb-3',
                'paragraph': 'leading-7 mb-4',
                'code-inline': 'bg-blue-50 text-blue-800 px-2 py-1 rounded text-sm font-mono',
                'code-block': 'bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-x-auto my-4 text-sm',
                'alert': 'border border-blue-200 bg-blue-50 text-blue-800 p-4 rounded-lg mb-4'
            }
        }
    },

    /**
     * Minimal preset with basic styling
     */
    minimal: {
        renderer: {
            format: 'html' as const,
            sanitize: true
        }
    },

    /**
     * Core-only preset with just markdown basics
     */
    coreOnly: {
        renderer: {
            format: 'tailwind' as const
        }
    },

    /**
     * Performance preset with minimal processing
     */
    fast: {
        parser: {
            validateMarkdown: false,
            maxIterations: 1000
        },
        renderer: {
            format: 'html' as const,
            sanitize: false
        }
    }
} as const;

/**
 * Create engine with preset configuration
 */
export function createEngineWithPreset(
    presetName: keyof typeof presets,
    additionalConfig?: EngineConfig
): ChangerawrMarkdown {
    const preset = presets[presetName];

    if (presetName === 'coreOnly') {
        return createCoreOnlyEngine(additionalConfig);
    }

    return new ChangerawrMarkdown({
        ...preset,
        ...additionalConfig
    });
}