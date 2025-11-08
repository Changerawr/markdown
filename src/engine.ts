import { MarkdownParser } from './parser';
import { MarkdownRenderer } from './renderer';
import { LRUCache, hashContent } from './cache';
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

export interface RenderMetrics {
    inputSize: number;
    parseTime: number;
    renderTime: number;
    totalTime: number;
    tokenCount: number;
    cacheHit: boolean;
}

export class ChangerawrMarkdown {
    private parser: MarkdownParser;
    private renderer: MarkdownRenderer;
    private extensions = new Map<string, Extension>();

    // Performance & Caching
    private parseCache: LRUCache<string, MarkdownToken[]>;
    private renderCache: LRUCache<string, string>;
    private parseTime = 0;
    private renderTime = 0;
    private lastTokenCount = 0;

    constructor(config?: EngineConfig) {
        this.parser = new MarkdownParser(config?.parser);
        this.renderer = new MarkdownRenderer(config?.renderer);

        // Initialize caches (enabled by default)
        this.parseCache = new LRUCache<string, MarkdownToken[]>(100);
        this.renderCache = new LRUCache<string, string>(100);

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
        // Check cache first
        const cacheKey = hashContent(markdown);
        const cached = this.parseCache.get(cacheKey);
        if (cached) {
            this.lastTokenCount = cached.length;
            return cached;
        }

        // Parse and cache
        const startTime = performance.now();
        const tokens = this.parser.parse(markdown);
        this.parseTime = performance.now() - startTime;
        this.lastTokenCount = tokens.length;

        this.parseCache.set(cacheKey, tokens);
        return tokens;
    }

    render(tokens: MarkdownToken[], cacheKey?: string): string {
        // If we have a cache key (from parse), use it for render cache too
        if (cacheKey) {
            const cached = this.renderCache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        // Render and cache
        const startTime = performance.now();
        const html = this.renderer.render(tokens);
        this.renderTime = performance.now() - startTime;

        if (cacheKey) {
            this.renderCache.set(cacheKey, html);
        }
        return html;
    }

    toHtml(markdown: string): string {
        const cacheKey = hashContent(markdown);

        // Check if we have the full HTML cached
        const cachedHtml = this.renderCache.get(cacheKey);
        if (cachedHtml) {
            return cachedHtml;
        }

        // Parse (may be cached)
        const tokens = this.parse(markdown);

        // Render with the same cache key
        return this.render(tokens, cacheKey);
    }

    /**
     * Render markdown with performance metrics
     */
    toHtmlWithMetrics(markdown: string): { html: string; metrics: RenderMetrics } {
        const startTotal = performance.now();

        const parseCacheKey = hashContent(markdown);
        const parseCacheHit = this.parseCache.has(parseCacheKey);

        const html = this.toHtml(markdown);
        const totalTime = performance.now() - startTotal;

        const metrics: RenderMetrics = {
            inputSize: markdown.length,
            parseTime: this.parseTime,
            renderTime: this.renderTime,
            totalTime,
            tokenCount: this.lastTokenCount,
            cacheHit: parseCacheHit
        };

        return { html, metrics };
    }

    /**
     * Stream-render large documents in chunks for better performance
     */
    async toHtmlStreamed(
        markdown: string,
        options: {
            chunkSize?: number;
            onChunk?: (chunk: { html: string; progress: number }) => void;
        } = {}
    ): Promise<string> {
        const chunkSize = options.chunkSize || 50;
        const tokens = this.parse(markdown);
        const totalTokens = tokens.length;
        const chunks: string[] = [];

        for (let i = 0; i < tokens.length; i += chunkSize) {
            const chunkTokens = tokens.slice(i, Math.min(i + chunkSize, tokens.length));
            const chunkHtml = this.render(chunkTokens);
            chunks.push(chunkHtml);

            if (options.onChunk) {
                options.onChunk({
                    html: chunkHtml,
                    progress: Math.min(i + chunkSize, tokens.length) / totalTokens
                });
            }

            // Yield to event loop
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        return chunks.join('');
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
            parseTime: this.parseTime,
            renderTime: this.renderTime,
            tokenCount: this.lastTokenCount,
            iterationCount: 0
        };
    }

    getPerformanceMetrics(): PerformanceMetrics | null {
        return {
            parseTime: this.parseTime,
            renderTime: this.renderTime,
            totalTime: this.parseTime + this.renderTime,
            tokenCount: this.lastTokenCount
        };
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            parse: this.parseCache.getStats(),
            render: this.renderCache.getStats()
        };
    }

    /**
     * Clear all caches
     */
    clearCaches(): void {
        this.parseCache.clear();
        this.renderCache.clear();
    }

    /**
     * Update cache capacity
     */
    setCacheSize(size: number): void {
        this.parseCache.setCapacity(size);
        this.renderCache.setCapacity(size);
    }

    private rebuildParserAndRenderer(): void {
        // Get current configs
        const parserConfig = this.parser.getConfig();
        const rendererConfig = this.renderer.getConfig();

        // Recreate parser and renderer completely
        this.parser = new MarkdownParser(parserConfig);
        this.renderer = new MarkdownRenderer(rendererConfig);

        // Clear caches since we're rebuilding
        this.parseCache.clear();
        this.renderCache.clear();

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