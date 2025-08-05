import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChangerawrMarkdown } from '../engine';
import type {
    UseMarkdownOptions,
    UseMarkdownResult,
    MarkdownEngineHookOptions,
    MarkdownDebugInfo,
    EngineConfig,
    RendererConfig,
    OutputFormat
} from './types';
import type { MarkdownToken } from '../types';

/**
 * Main hook for rendering markdown content
 */
export function useMarkdown(
    initialContent = '',
    options: UseMarkdownOptions = {}
): UseMarkdownResult {
    const [content, setContent] = useState(initialContent);
    const [html, setHtml] = useState('');
    const [tokens, setTokens] = useState<MarkdownToken[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [debug, setDebug] = useState<MarkdownDebugInfo | null>(null);

    const engineRef = useRef<ChangerawrMarkdown | null>(null);

    // Create engine instance with proper type safety - recreate when format changes
    const engine = useMemo(() => {
        // Always recreate engine when dependencies change
        const format: OutputFormat = options.format ?? 'tailwind';
        const rendererConfig: RendererConfig = {
            format,
            ...(options.config?.renderer && {
                sanitize: options.config.renderer.sanitize,
                allowUnsafeHtml: options.config.renderer.allowUnsafeHtml,
                customClasses: options.config.renderer.customClasses,
                debugMode: options.debug ?? options.config.renderer.debugMode ?? false
            })
        };

        // Build full engine config
        const engineConfig: EngineConfig = {
            ...(options.config && {
                parser: options.config.parser,
                extensions: options.config.extensions
            }),
            renderer: rendererConfig
        };

        const newEngine = new ChangerawrMarkdown(engineConfig);

        // Register custom extensions if provided
        if (options.extensions) {
            options.extensions.forEach(extension => {
                newEngine.registerExtension(extension);
            });
        }

        engineRef.current = newEngine;
        return newEngine;
    }, [options.config, options.format, options.debug, options.extensions]);

    // Process markdown content
    const processMarkdown = useCallback((markdownContent: string) => {
        if (!markdownContent.trim()) {
            setHtml('');
            setTokens([]);
            setError(null);
            setDebug(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Parse and render using the actual engine methods
            const parsedTokens = engine.parse(markdownContent);
            const renderedHtml = engine.render(parsedTokens);

            setHtml(renderedHtml);
            setTokens(parsedTokens);

            // Set debug info if enabled
            if (options.debug) {
                const coreDebug = engine.getDebugInfo();
                const performanceMetrics = engine.getPerformanceMetrics();

                setDebug({
                    core: coreDebug,
                    performance: performanceMetrics,
                    renderedAt: new Date(),
                    contentLength: markdownContent.length,
                    htmlLength: renderedHtml.length,
                    extensionsUsed: engine.getExtensions()
                });
            }

        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
        } finally {
            setIsLoading(false);
        }
    }, [engine, options.debug]);

    // Process content when it changes
    useEffect(() => {
        processMarkdown(content);
    }, [content, processMarkdown]);

    // Update content when initialContent changes
    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const render = useCallback((newContent: string) => {
        setContent(newContent);
    }, []);

    const clear = useCallback(() => {
        setContent('');
        setHtml('');
        setTokens([]);
        setError(null);
        setDebug(null);
    }, []);

    return {
        html,
        tokens,
        isLoading,
        error,
        debug,
        render,
        clear
    };
}

/**
 * Hook for managing a markdown engine instance
 */
export function useMarkdownEngine(options: MarkdownEngineHookOptions = {}) {
    const engineRef = useRef<ChangerawrMarkdown | null>(null);

    const engine = useMemo(() => {
        // Always recreate engine when dependencies change
        const engineConfig: EngineConfig = {
            ...options.config,
            renderer: {
                format: 'tailwind', // Required field
                ...options.config?.renderer
            }
        };

        // Handle auto-register extensions option
        if (options.autoRegisterExtensions === false) {
            engineConfig.extensions = [];
        }

        const newEngine = new ChangerawrMarkdown(engineConfig);
        engineRef.current = newEngine;
        return newEngine;
    }, [options.config, options.autoRegisterExtensions]);

    const toHtml = useCallback((content: string) => {
        return engine.toHtml(content);
    }, [engine]);

    const parse = useCallback((content: string) => {
        return engine.parse(content);
    }, [engine]);

    const render = useCallback((tokens: MarkdownToken[]) => {
        return engine.render(tokens);
    }, [engine]);

    const getExtensions = useCallback(() => {
        return engine.getExtensions();
    }, [engine]);

    const hasExtension = useCallback((name: string) => {
        return engine.hasExtension(name);
    }, [engine]);

    const registerExtension = useCallback((extension: Parameters<ChangerawrMarkdown['registerExtension']>[0]) => {
        return engine.registerExtension(extension);
    }, [engine]);

    const unregisterExtension = useCallback((name: string) => {
        return engine.unregisterExtension(name);
    }, [engine]);

    const getWarnings = useCallback(() => {
        return engine.getWarnings();
    }, [engine]);

    const getDebugInfo = useCallback(() => {
        return engine.getDebugInfo();
    }, [engine]);

    const getPerformanceMetrics = useCallback(() => {
        return engine.getPerformanceMetrics();
    }, [engine]);

    return {
        engine,
        toHtml,
        parse,
        render,
        getExtensions,
        hasExtension,
        registerExtension,
        unregisterExtension,
        getWarnings,
        getDebugInfo,
        getPerformanceMetrics
    };
}

/**
 * Debug hook for markdown processing
 */
export function useMarkdownDebug(content: string) {
    const { html, tokens, debug } = useMarkdown(content, { debug: true });

    return {
        html,
        tokens,
        debug,
        stats: {
            tokenCount: tokens.length,
            htmlLength: html.length,
            contentLength: content.length
        }
    };
}