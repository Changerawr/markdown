import React, { useMemo, useEffect } from 'react';
import { useMarkdown } from './hooks';
import type { MarkdownRendererProps } from './types';

/**
 * MarkdownRenderer - Main React component for rendering markdown
 *
 * @example
 * ```tsx
 * <MarkdownRenderer
 *   content="# Hello **World**!"
 *   className="prose"
 * />
 * ```
 */
export function MarkdownRenderer({
                                     content,
                                     className,
                                     config,
                                     format = 'tailwind',
                                     as: Component = 'div',
                                     wrapperProps = {},
                                     debug = false,
                                     errorFallback,
                                     loading,
                                     onRender,
                                     onError,
                                     extensions,
                                     sanitize = true,
                                     allowUnsafeHtml = false,
                                     ...restProps
                                 }: MarkdownRendererProps) {

    // Prepare markdown options
    const markdownOptions = useMemo(() => ({
        config: {
            ...config,
            renderer: {
                format,
                sanitize,
                allowUnsafeHtml,
                debugMode: debug,
                ...config?.renderer
            }
        },
        debug,
        ...(extensions && { extensions }),
        debounceMs: 100, // Small debounce for performance
        memoize: true
    }), [config, format, debug, extensions, sanitize, allowUnsafeHtml]);

    // Use the markdown hook
    const { html, tokens, isLoading, error } = useMarkdown(content, markdownOptions);

    // Call onRender callback when rendering completes
    useEffect(() => {
        if (html && tokens.length > 0 && onRender) {
            onRender(html, tokens);
        }
    }, [html, tokens, onRender]);

    // Call onError callback when error occurs
    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    // Show loading state
    if (isLoading && loading) {
        return <>{loading}</>;
    }

    // Show error state
    if (error) {
        if (errorFallback) {
            return <>{errorFallback(error)}</>;
        }

        // Default error display
        return (
            <div className="changerawr-error bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <div className="font-medium">Markdown Render Error</div>
                <div className="text-sm mt-1">{error.message}</div>
            </div>
        );
    }

    // Prepare wrapper props
    const finalWrapperProps = {
        ...wrapperProps,
        ...restProps,
        className: className ? `${className} changerawr-markdown` : 'changerawr-markdown',
        dangerouslySetInnerHTML: { __html: html }
    };

    // Render the component
    return React.createElement(Component, finalWrapperProps);
}

// Display name for debugging
MarkdownRenderer.displayName = 'MarkdownRenderer';

/**
 * MarkdownRenderer with error boundary
 */
export function SafeMarkdownRenderer(props: MarkdownRendererProps) {
    return (
        <MarkdownErrorBoundary {...(props.errorFallback && { fallback: props.errorFallback })}>
            <MarkdownRenderer {...props} />
        </MarkdownErrorBoundary>
    );
}

/**
 * Error boundary component for markdown rendering
 */
interface MarkdownErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: (error: Error) => React.ReactNode;
}

interface MarkdownErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class MarkdownErrorBoundary extends React.Component<
    MarkdownErrorBoundaryProps,
    MarkdownErrorBoundaryState
> {
    constructor(props: MarkdownErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): MarkdownErrorBoundaryState {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('MarkdownRenderer Error:', error, errorInfo);
    }

    override render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error);
            }

            return (
                <div className="changerawr-error-boundary bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <div className="font-medium">Markdown Component Error</div>
                    <div className="text-sm mt-1">{this.state.error.message}</div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="text-xs mt-2 px-2 py-1 bg-red-200 hover:bg-red-300 rounded"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Lightweight markdown renderer for simple use cases
 */
export function SimpleMarkdownRenderer({
                                           content,
                                           className
                                       }: {
    content: string;
    className?: string;
}) {
    return (
        <MarkdownRenderer
            content={content}
            {...(className && { className })}
            format="tailwind"
            config={{
                renderer: {
                    format: 'tailwind',
                    sanitize: true
                }
            }}
        />
    );
}

/**
 * HTML-only markdown renderer (no Tailwind classes)
 */
export function HTMLMarkdownRenderer({
                                         content,
                                         className,
                                         sanitize = true
                                     }: {
    content: string;
    className?: string;
    sanitize?: boolean;
}) {
    return (
        <MarkdownRenderer
            content={content}
            {...(className && { className })}
            format="html"
            sanitize={sanitize}
            config={{
                renderer: { format: 'html' }
            }}
        />
    );
}

/**
 * Debug markdown renderer with performance info
 */
export function DebugMarkdownRenderer({
                                          content,
                                          className
                                      }: {
    content: string;
    className?: string;
}) {
    const { html, debug } = useMarkdown(content, {
        debug: true,
        format: 'tailwind'
    });

    return (
        <div className="changerawr-debug-wrapper">
            <div
                className={className}
                dangerouslySetInnerHTML={{ __html: html }}
            />

            {debug && (
                <details className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-sm">
                    <summary className="font-medium cursor-pointer">Debug Information</summary>
                    <div className="mt-2 space-y-2">
                        <div><strong>Rendered:</strong> {debug.renderedAt.toLocaleTimeString()}</div>
                        <div><strong>Content Length:</strong> {debug.contentLength} chars</div>
                        <div><strong>HTML Length:</strong> {debug.htmlLength} chars</div>
                        <div><strong>Extensions:</strong> {debug.extensionsUsed.join(', ')}</div>
                        {debug.performance && (
                            <div><strong>Parse Time:</strong> {debug.performance.parseTime.toFixed(2)}ms</div>
                        )}
                        {debug.core?.warnings && debug.core.warnings.length > 0 && (
                            <div>
                                <strong>Warnings:</strong>
                                <ul className="ml-4 list-disc">
                                    {debug.core.warnings.map((warning, i) => (
                                        <li key={i} className="text-yellow-700">{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </details>
            )}
        </div>
    );
}