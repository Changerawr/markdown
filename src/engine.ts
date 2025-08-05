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

// Built-in extensions
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

        // Register built-in extensions first
        this.registerBuiltInExtensions();

        // Register custom extensions if provided
        if (config?.extensions) {
            config.extensions.forEach(extension => {
                this.registerExtension(extension);
            });
        }

        // Ensure default rules are setup after extensions
        this.parser.setupDefaultRulesIfEmpty();
    }

    /**
     * Register a custom extension
     */
    registerExtension(extension: Extension): ExtensionRegistration {
        try {
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

    /**
     * Unregister an extension
     */
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

    /**
     * Parse markdown content into tokens
     */
    parse(markdown: string): MarkdownToken[] {
        return this.parser.parse(markdown);
    }

    /**
     * Render tokens to HTML
     */
    render(tokens: MarkdownToken[]): string {
        return this.renderer.render(tokens);
    }

    /**
     * Parse and render markdown to HTML in one step
     */
    toHtml(markdown: string): string {
        const tokens = this.parse(markdown);
        return this.render(tokens);
    }

    /**
     * Get list of registered extensions
     */
    getExtensions(): string[] {
        return Array.from(this.extensions.keys());
    }

    /**
     * Check if extension is registered
     */
    hasExtension(name: string): boolean {
        return this.extensions.has(name);
    }

    /**
     * Get parser warnings
     */
    getWarnings(): string[] {
        return [...this.parser.getWarnings(), ...this.renderer.getWarnings()];
    }

    /**
     * Get debug information from last render
     */
    getDebugInfo(): DebugInfo | null {
        return {
            warnings: this.getWarnings(),
            parseTime: 0,
            renderTime: 0,
            tokenCount: 0,
            iterationCount: 0
        };
    }

    /**
     * Get performance metrics for the last operation
     */
    getPerformanceMetrics(): PerformanceMetrics | null {
        return {
            parseTime: 0,
            renderTime: 0,
            totalTime: 0,
            tokenCount: 0
        };
    }

    /**
     * Register built-in extensions
     */
    private registerBuiltInExtensions(): void {
        this.registerExtension(AlertExtension);
        this.registerExtension(ButtonExtension);
        this.registerExtension(EmbedExtension);
    }

    /**
     * Rebuild parser and renderer with current extensions
     */
    private rebuildParserAndRenderer(): void {
        // Get current configs
        const parserConfig = this.parser.getConfig();
        const rendererConfig = this.renderer.getConfig();

        // Recreate parser and renderer
        this.parser = new MarkdownParser(parserConfig);
        this.renderer = new MarkdownRenderer(rendererConfig);

        // Re-register only the extensions that are still in the map
        const extensionsToRegister = Array.from(this.extensions.values());

        // Clear the map and re-register from scratch
        this.extensions.clear();

        // Register remaining extensions
        extensionsToRegister.forEach(extension => {
            this.registerExtension(extension);
        });

        // Ensure default rules are setup
        this.parser.setupDefaultRulesIfEmpty();
    }
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