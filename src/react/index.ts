/**
 * React exports
 */

// Main component
export { MarkdownRenderer } from './MarkdownRenderer';

// Component-extension renderer (for custom integrations)
export { TokenTreeRenderer } from './ComponentRenderer';

// Hooks
export {
    useMarkdown,
    useMarkdownEngine,
    useMarkdownDebug,
    useMarkdownComponents
} from './hooks';

// Types
export type {
    MarkdownRendererProps,
    UseMarkdownOptions,
    UseMarkdownResult,
    MarkdownEngineHookOptions,
    MarkdownDebugInfo,
    // Component extension types
    ReactComponentTokenProps,
    ReactComponentRenderRule,
    ReactComponentExtension
} from './types';

// Re-export core types for convenience
export type {
    MarkdownToken,
    Extension,
    EngineConfig,
    OutputFormat,
    ComponentTokenProps,
    ComponentRenderRule,
    ComponentExtension
} from '../types';