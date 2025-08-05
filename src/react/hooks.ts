import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChangerawrMarkdown } from '../engine';
import { debounce } from '../utils';
import type {
    UseMarkdownOptions,
    UseMarkdownResult,
    MarkdownEngineHookOptions,
    MarkdownDebugInfo
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
    const abortControllerRef = useRef<AbortController | null>(null);

    // Create engine instance
    const engine = useMemo(() => {
        if (!engineRef.current) {
            const newEngine = new ChangerawrMarkdown({
                ...options.config,
                renderer: {
                    format: options.format || 'tailwind',
                    debugMode: options.debug,
                    ...options.config?.renderer
                }
            });

            // Register custom extensions if provided
            if (options.extensions) {
                options.extensions.forEach(extension => {
                    newEngine.registerExtension(extension);
                });
            }

            engineRef.current = newEngine;
        }
        return engineRef.current;
    }, [options.config, options.format, options.debug, options.extensions]);

    // Process markdown content
    const processMarkdown = useCallback(async (markdownContent: string) => {
        if (!markdownContent.trim()) {
            setHtml('');
            setTokens([]);
            setError(null);
            setDebug(null);
            return;
        }

        // Cancel previous processing
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);
        setError(null);

        try {
            const startTime = performance.now();

            // Parse and render
            const parsedTokens = engine.parse(markdownContent);
            const renderedHtml = engine.render(parsedTokens);

            const endTime = performance.now();

            // Check if operation was aborted
            if (abortControllerRef.current.signal.aborted) {
                return;
            }

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
            if (!abortControllerRef.current?.signal.aborted) {
                const errorObj = err instanceof Error ? err : new Error(String(err));
                setError(errorObj);
            }
        } finally {
            setIsLoading(false);
        }
    }, [engine, options.debug]);

    // Debounced process function
    const debouncedProcess = useMemo(() => {
        const delay = options.debounceMs || 0;
        return delay > 0 ? debounce(processMarkdown, delay) : processMarkdown;
    }, [processMarkdown, options.debounceMs]);

    // Process content when it changes
    useEffect(() => {
        debouncedProcess(content);
    }, [content, debouncedProcess]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

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
        if (!engineRef.current) {
            engineRef.current = new ChangerawrMarkdown(options.config);
        }
        return engineRef.current;
    }, [options.config]);

    const registerExtension = useCallback((extension: Parameters<ChangerawrMarkdown['registerExtension']>[0]) => {
        return engine.registerExtension(extension);
    }, [engine]);

    const unregisterExtension = useCallback((name: string) => {
        return engine.unregisterExtension(name);
    }, [engine]);

    const parse = useCallback((content: string) => {
        return engine.parse(content);
    }, [engine]);

    const render = useCallback((tokens: MarkdownToken[]) => {
        return engine.render(tokens);
    }, [engine]);

    const toHtml = useCallback((content: string) => {
        return engine.toHtml(content);
    }, [engine]);

    const getExtensions = useCallback(() => {
        return engine.getExtensions();
    }, [engine]);

    const hasExtension = useCallback((name: string) => {
        return engine.hasExtension(name);
    }, [engine]);

    const getWarnings = useCallback(() => {
        return engine.getWarnings();
    }, [engine]);

    return {
        engine,
        registerExtension,
        unregisterExtension,
        parse,
        render,
        toHtml,
        getExtensions,
        hasExtension,
        getWarnings
    };
}

/**
 * Hook for debug information and performance monitoring
 */
export function useMarkdownDebug(engine: ChangerawrMarkdown) {
    const [debugInfo, setDebugInfo] = useState<MarkdownDebugInfo | null>(null);

    const updateDebugInfo = useCallback(() => {
        const coreDebug = engine.getDebugInfo();
        const performanceMetrics = engine.getPerformanceMetrics();

        setDebugInfo({
            core: coreDebug,
            performance: performanceMetrics,
            renderedAt: new Date(),
            contentLength: 0, // Will be updated by caller
            htmlLength: 0,    // Will be updated by caller
            extensionsUsed: engine.getExtensions()
        });
    }, [engine]);

    const clearDebugInfo = useCallback(() => {
        setDebugInfo(null);
    }, []);

    return {
        debugInfo,
        updateDebugInfo,
        clearDebugInfo
    };
}