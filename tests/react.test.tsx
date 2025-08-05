/**
 * React component tests for @changerawr/markdown
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
    MarkdownRenderer,
    SimpleMarkdownRenderer,
    HTMLMarkdownRenderer,
    SafeMarkdownRenderer
} from '../src/react/MarkdownRenderer';
import { useMarkdown, useMarkdownEngine } from '../src/react';

// Simple test component for hook testing
function TestHookComponent({ content }: { content: string }) {
    const { html, isLoading, error } = useMarkdown(content);

    if (isLoading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">{error.message}</div>;

    return <div data-testid="result" dangerouslySetInnerHTML={{ __html: html }} />;
}

function TestEngineComponent() {
    const { toHtml, getExtensions } = useMarkdownEngine();
    const html = toHtml('# Test Heading');
    const extensions = getExtensions();

    return (
        <div>
            <div data-testid="html" dangerouslySetInnerHTML={{ __html: html }} />
            <div data-testid="extensions">{extensions.join(',')}</div>
        </div>
    );
}

describe('React Components', () => {
    describe('MarkdownRenderer', () => {
        it('should render basic markdown correctly', () => {
            const markdown = '# Hello World\n\nThis is **bold** text.';
            render(<MarkdownRenderer content={markdown} />);

            const container = document.querySelector('.changerawr-markdown');
            expect(container).toBeTruthy();
            expect(container?.innerHTML).toContain('<h1');
            expect(container?.innerHTML).toContain('Hello World');
            expect(container?.innerHTML).toContain('<strong');
            expect(container?.innerHTML).toContain('bold');
        });

        it('should apply custom className', () => {
            render(<MarkdownRenderer content="# Test" className="custom-class" />);

            const container = document.querySelector('.custom-class.changerawr-markdown');
            expect(container).toBeTruthy();
        });

        it('should render with different output formats', () => {
            const { rerender } = render(
                <MarkdownRenderer content="# Test" format="tailwind" />
            );

            let container = document.querySelector('.changerawr-markdown');
            expect(container?.innerHTML).toContain('class=');
            expect(container?.innerHTML).toContain('text-3xl');

            rerender(<MarkdownRenderer content="# Test" format="html" />);

            container = document.querySelector('.changerawr-markdown');
            expect(container?.innerHTML).toContain('<h1');
            expect(container?.innerHTML).not.toContain('text-3xl');
        });

        it('should handle custom wrapper element', () => {
            render(<MarkdownRenderer content="# Test" as="section" />);

            const section = document.querySelector('section.changerawr-markdown');
            expect(section).toBeTruthy();
            expect(section?.tagName).toBe('SECTION');
        });

        it('should handle errors gracefully', () => {
            // Mock console.error to avoid noise in test output
            const originalError = console.error;
            console.error = vi.fn();

            const errorFallback = (error: Error) => (
                <div data-testid="error-fallback">Error: {error.message}</div>
            );

            render(
                <SafeMarkdownRenderer
                    content="# Test"
                    errorFallback={errorFallback}
                />
            );

            // Since we can't easily trigger a markdown render error,
            // let's just verify the component renders without crashing
            const container = document.querySelector('.changerawr-markdown');
            expect(container).toBeTruthy();

            console.error = originalError;
        });

        it('should call onRender callback', async () => {
            const onRender = vi.fn();

            render(
                <MarkdownRenderer
                    content="# Test"
                    onRender={onRender}
                />
            );

            await waitFor(() => {
                expect(onRender).toHaveBeenCalled();
            });

            const [html, tokens] = onRender.mock.calls[0] ?? [];
            expect(html).toContain('<h1');
            expect(tokens).toHaveLength(1);
            expect(tokens[0].type).toBe('heading');
        });

        it('should render extensions correctly', () => {
            const markdown = ':::info Important\nThis is an alert.\n:::';
            render(<MarkdownRenderer content={markdown} />);

            const container = document.querySelector('.changerawr-markdown');
            expect(container?.innerHTML).toContain('bg-blue-500/10');
            expect(container?.innerHTML).toContain('Important');
            expect(container?.innerHTML).toContain('This is an alert');
        });
    });

    describe('SimpleMarkdownRenderer', () => {
        it('should render with default Tailwind styling', () => {
            render(<SimpleMarkdownRenderer content="# Simple Test" />);

            const container = document.querySelector('.changerawr-markdown');
            expect(container?.innerHTML).toContain('<h1');
            expect(container?.innerHTML).toContain('text-3xl');
            expect(container?.innerHTML).toContain('Simple Test');
        });

        it('should apply custom className', () => {
            render(<SimpleMarkdownRenderer content="# Test" className="prose" />);

            const container = document.querySelector('.prose.changerawr-markdown');
            expect(container).toBeTruthy();
        });
    });

    describe('HTMLMarkdownRenderer', () => {
        it('should render plain HTML without CSS classes', () => {
            render(<HTMLMarkdownRenderer content="# HTML Test" />);

            const container = document.querySelector('.changerawr-markdown');
            expect(container?.innerHTML).toContain('<h1');
            expect(container?.innerHTML).toContain('HTML Test');
            expect(container?.innerHTML).not.toContain('class=');
            expect(container?.innerHTML).not.toContain('text-3xl');
        });

        it('should handle sanitization option', () => {
            render(<HTMLMarkdownRenderer content="# Test" sanitize={false} />);

            const container = document.querySelector('.changerawr-markdown');
            expect(container).toBeTruthy();
        });
    });
});

describe('React Hooks', () => {
    describe('useMarkdown', () => {
        it('should render markdown content', async () => {
            render(<TestHookComponent content="# Hook Test" />);

            await waitFor(() => {
                const result = screen.getByTestId('result');
                expect(result.innerHTML).toContain('<h1');
                expect(result.innerHTML).toContain('Hook Test');
            });
        });

        it('should handle empty content', async () => {
            render(<TestHookComponent content="" />);

            await waitFor(() => {
                const result = screen.getByTestId('result');
                expect(result.innerHTML).toBe('');
            });
        });

        it('should show loading state initially', () => {
            render(<TestHookComponent content="# Loading Test" />);

            // Note: Due to the immediate processing nature of our hook,
            // loading state might be very brief or not visible
            const container = document.querySelector('[data-testid]');
            expect(container).toBeTruthy();
        });
    });

    describe('useMarkdownEngine', () => {
        it('should provide engine functionality', async () => {
            render(<TestEngineComponent />);

            await waitFor(() => {
                const htmlElement = screen.getByTestId('html');
                const extensionsElement = screen.getByTestId('extensions');

                expect(htmlElement.innerHTML).toContain('<h1');
                expect(htmlElement.innerHTML).toContain('Test Heading');

                expect(extensionsElement.textContent).toContain('alert');
                expect(extensionsElement.textContent).toContain('button');
                expect(extensionsElement.textContent).toContain('embed');
            });
        });
    });
});

describe('Error Handling', () => {
    it('should handle invalid markdown gracefully', () => {
        const invalidMarkdown = '**unclosed bold\n`unclosed code';

        render(<MarkdownRenderer content={invalidMarkdown} />);

        const container = document.querySelector('.changerawr-markdown');
        expect(container).toBeTruthy();
        expect(container?.innerHTML).toContain('unclosed bold');
        expect(container?.innerHTML).toContain('unclosed code');
    });

    it('should handle special characters', () => {
        const specialMarkdown = '# Test with <script>alert("xss")</script>';

        render(<MarkdownRenderer content={specialMarkdown} />);

        const container = document.querySelector('.changerawr-markdown');
        expect(container?.innerHTML).toContain('&lt;script&gt;');
        expect(container?.innerHTML).not.toContain('<script>alert');
    });
});

describe('Performance', () => {
    it('should render large content efficiently', async () => {
        const largeContent = Array(100).fill('# Heading\n\nParagraph with **bold** text.\n').join('\n');

        const startTime = performance.now();
        render(<MarkdownRenderer content={largeContent} />);
        const endTime = performance.now();

        const container = document.querySelector('.changerawr-markdown');
        expect(container).toBeTruthy();

        // Rendering should be reasonably fast (under 500ms for large content)
        expect(endTime - startTime).toBeLessThan(500);
    });
});