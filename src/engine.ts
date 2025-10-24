import { MarkdownParser } from './parser';
import { MarkdownRenderer } from './renderer';
import type {
    MarkdownToken,
    Extension,
    EngineConfig,
    ExtensionRegistration,
    DebugInfo,
    PerformanceMetrics
} from './types';

// Import core extensions
import { CoreExtensions } from './extensions/core';
// Import feature extensions
import { AlertExtension } from './extensions/alert';
import { ButtonExtension } from './extensions/button';
import { EmbedExtension } from './extensions/embed';

export class ChangerawrMarkdown {
    private parser: MarkdownParser;
    private renderer: MarkdownRenderer;
    private extensions = new Map<string, Extension>();

    constructor(config?: EngineConfig) {
        this.parser = new MarkdownParser(config?.parser);
        this.renderer = new MarkdownRenderer(config?.renderer);

        // Register core extensions first (for backwards compatibility)
        this.registerCoreExtensions();

        // Register feature extensions (for backwards compatibility)
        this.registerFeatureExtensions();

        // Register custom extensions if provided
        if (config?.extensions) {
            config.extensions.forEach(extension => {
                this.registerExtension(extension);
            });
        }

        // No need for default rules - everything is extension-based now!
    }

    private registerFeatureExtensions(): void {
        this.registerExtension(AlertExtension);
        this.registerExtension(ButtonExtension);
        this.registerExtension(EmbedExtension);
    }

    private registerCoreExtensions(): void {
        CoreExtensions.forEach(extension => {
            this.registerExtension(extension);
        });
    }

    registerExtension(extension: Extension): ExtensionRegistration {
        try {
            // Validate extension before registration
            if (!extension.name || typeof extension.name !== 'string') {
                throw new Error('Extension must have a valid name');
            }

            if (!Array.isArray(extension.parseRules)) {
                throw new Error('Extension must have parseRules array');
            }

            if (!Array.isArray(extension.renderRules)) {
                throw new Error('Extension must have renderRules array');
            }

            // Validate parse rules
            extension.parseRules.forEach((rule, index) => {
                if (!rule.name || typeof rule.name !== 'string') {
                    throw new Error(`Parse rule ${index} must have a valid name`);
                }
                if (!rule.pattern || !(rule.pattern instanceof RegExp)) {
                    throw new Error(`Parse rule ${index} must have a valid RegExp pattern`);
                }
                if (!rule.render || typeof rule.render !== 'function') {
                    throw new Error(`Parse rule ${index} must have a valid render function`);
                }
            });

            // Validate render rules
            extension.renderRules.forEach((rule, index) => {
                if (!rule.type || typeof rule.type !== 'string') {
                    throw new Error(`Render rule ${index} must have a valid type`);
                }
                if (!rule.render || typeof rule.render !== 'function') {
                    throw new Error(`Render rule ${index} must have a valid render function`);
                }
            });

            // Store extension
            this.extensions.set(extension.name, extension);

            // Add rules to parser and renderer
            extension.parseRules.forEach(rule => {
                this.parser.addRule(rule);
            });

            extension.renderRules.forEach(rule => {
                this.renderer.addRule(rule);
            });

            return {
                success: true,
                extensionName: extension.name
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            return {
                success: false,
                extensionName: extension.name,
                error: errorMessage
            };
        }
    }

    unregisterExtension(name: string): boolean {
        const extension = this.extensions.get(name);
        if (!extension) {
            return false;
        }

        try {
            // Remove extension from map
            this.extensions.delete(name);

            // Rebuild parser and renderer to remove extension rules
            this.rebuildParserAndRenderer();

            return true;
        } catch {
            return false;
        }
    }

    parse(markdown: string): MarkdownToken[] {
        return this.parser.parse(markdown);
    }

    render(tokens: MarkdownToken[]): string {
        // The renderer will now recursively render children tokens
        // No need to inject callbacks - children are already tokenized!
        return this.renderer.render(tokens);
    }

    toHtml(markdown: string): string {
        const tokens = this.parse(markdown);
        return this.render(tokens);
    }

    getExtensions(): string[] {
        return Array.from(this.extensions.keys());
    }

    hasExtension(name: string): boolean {
        return this.extensions.has(name);
    }

    getWarnings(): string[] {
        return [...this.parser.getWarnings(), ...this.renderer.getWarnings()];
    }

    getDebugInfo(): DebugInfo | null {
        return {
            warnings: this.getWarnings(),
            parseTime: 0,
            renderTime: 0,
            tokenCount: 0,
            iterationCount: 0
        };
    }

    getPerformanceMetrics(): PerformanceMetrics | null {
        return {
            parseTime: 0,
            renderTime: 0,
            totalTime: 0,
            tokenCount: 0
        };
    }

    private rebuildParserAndRenderer(): void {
        // Get current configs
        const parserConfig = this.parser.getConfig();
        const rendererConfig = this.renderer.getConfig();

        // Recreate parser and renderer completely
        this.parser = new MarkdownParser(parserConfig);
        this.renderer = new MarkdownRenderer(rendererConfig);

        // Get the extensions that are still in the map (after removal)
        const extensionsToRegister = Array.from(this.extensions.values());

        // Re-register remaining extensions in the correct order
        // Feature extensions first
        const featureExtensions = extensionsToRegister.filter(ext =>
            ['alert', 'button', 'embed'].includes(ext.name)
        );

        // Core extensions second
        const coreExtensions = extensionsToRegister.filter(ext =>
            ['text', 'heading', 'bold', 'italic', 'code', 'codeblock', 'link', 'image', 'list', 'task-list', 'blockquote', 'hr', 'paragraph', 'line-break'].includes(ext.name)
        );

        // Custom extensions last
        const customExtensions = extensionsToRegister.filter(ext =>
            !['alert', 'button', 'embed', 'text', 'heading', 'bold', 'italic', 'code', 'codeblock', 'link', 'image', 'list', 'task-list', 'blockquote', 'hr', 'paragraph', 'line-break'].includes(ext.name)
        );

        // Register in correct order without going through the extension map
        [...featureExtensions, ...coreExtensions, ...customExtensions].forEach(extension => {
            // Add rules directly to parser and renderer
            extension.parseRules.forEach(rule => {
                this.parser.addRule(rule);
            });

            extension.renderRules.forEach(rule => {
                this.renderer.addRule(rule);
            });
        });
    }
}

// Factory functions for specific use cases
export function createMinimalEngine(config?: EngineConfig): ChangerawrMarkdown {
    // Create engine with NO default extensions
    const minimalConfig = {
        ...config,
        extensions: config?.extensions || []
    };

    const engine = new ChangerawrMarkdown();

    // Clear all default extensions
    const defaultExtensions = engine.getExtensions();
    defaultExtensions.forEach(ext => engine.unregisterExtension(ext));

    // Only add the ones specified in config
    if (minimalConfig.extensions) {
        minimalConfig.extensions.forEach(ext => engine.registerExtension(ext));
    }

    return engine;
}

export function createCoreOnlyEngine(config?: EngineConfig): ChangerawrMarkdown {
    // Create engine with only core extensions (no alerts, buttons, embeds)
    const engine = new ChangerawrMarkdown();

    // Remove feature extensions, keep core
    engine.unregisterExtension('alert');
    engine.unregisterExtension('button');
    engine.unregisterExtension('embed');

    // Add any custom extensions
    if (config?.extensions) {
        config.extensions.forEach(ext => engine.registerExtension(ext));
    }

    return engine;
}

// Default instance for convenience functions
export const markdown = new ChangerawrMarkdown();

// Convenience functions
export function parseMarkdown(content: string): MarkdownToken[] {
    return markdown.parse(content);
}

export function renderMarkdown(content: string): string {
    return markdown.toHtml(content);
}