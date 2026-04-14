import React, { useMemo, useEffect } from 'react';
import { useMarkdownComponents } from './hooks';
import { TokenTreeRenderer } from './ComponentRenderer';
import type { MarkdownRendererProps, UseMarkdownOptions } from './types';

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
                                     componentExtensions,
                                     sanitize = true,
                                     allowUnsafeHtml = false,
                                     ...restProps
                                 }: MarkdownRendererProps) {
    // Prepare markdown options with proper type safety
    const markdownOptions = useMemo(() => {
        const options: UseMarkdownOptions = {
            format,
            debug,
            debounceMs: 0, // No debounce for tests
            memoize: true
        };

        // Add config if provided
        if (config) {
            options.config = {
                ...config,
                renderer: {
                    format, // Required field
                    sanitize,
                    allowUnsafeHtml,
                    debugMode: debug,
                    ...config.renderer
                }
            };
        } else {
            // Create minimal config with required format field
            options.config = {
                renderer: {
                    format,
                    sanitize,
                    allowUnsafeHtml,
                    debugMode: debug
                }
            };
        }

        if (extensions) {
            options.extensions = extensions;
        }

        if (componentExtensions) {
            options.componentExtensions = componentExtensions;
        }

        return options;
    }, [config, format, debug, extensions, componentExtensions, sanitize, allowUnsafeHtml]);

    // When component extensions are present, use the component-aware hook so we
    // can walk the token tree and render React components alongside HTML chunks.
    const hasComponentExtensions = componentExtensions && componentExtensions.length > 0;

    const {
        html,
        tokens,
        isLoading,
        error,
        renderBatch,
        componentMap
    } = useMarkdownComponents(content, markdownOptions);

    // Call onRender callback when rendering completes
    useEffect(() => {
        if (html && onRender) {
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

        return (
            <div className="changerawr-error bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <div className="font-medium">Markdown Render Error</div>
                <div className="text-sm mt-1">{error.message}</div>
            </div>
        );
    }

    const wrapperClassName = className
        ? `${className} changerawr-markdown`
        : 'changerawr-markdown';

    // Component-extension path: render a React element tree instead of raw HTML
    if (hasComponentExtensions && componentMap.size > 0) {
        return React.createElement(
            Component,
            { ...wrapperProps, ...restProps, className: wrapperClassName },
            <TokenTreeRenderer
                tokens={tokens}
                componentMap={componentMap}
                renderBatch={renderBatch}
            />
        );
    }

    // Default path: dangerouslySetInnerHTML (no component extensions active)
    const finalWrapperProps = {
        ...wrapperProps,
        ...restProps,
        className: wrapperClassName,
        dangerouslySetInnerHTML: { __html: html }
    };

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
    return (
        <MarkdownRenderer
            content={content}
            {...(className && { className })}
            debug={true}
            format="tailwind"
            config={{
                renderer: {
                    format: 'tailwind',
                    debugMode: true
                }
            }}
        />
    );
}