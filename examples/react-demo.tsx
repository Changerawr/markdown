/**
 * React Demo - Complete markdown editor with live preview
 *
 * This example shows how to build a full markdown editor using
 * the React components and hooks from @changerawr/markdown.
 */

import React, { useState, useCallback } from 'react';
import {
    MarkdownRenderer,
    useMarkdown,
    useMarkdownEngine
} from '@changerawr/markdown/react';

// Sample content to get users started
const SAMPLE_CONTENT = `# Welcome to the Markdown Editor!

This editor demonstrates the power of **@changerawr/markdown** with live preview.

## What can you do?

- Write standard **markdown** with *italic* and **bold** text
- Create lists and [links](https://github.com)
- Add code blocks and \`inline code\`
- Use our custom extensions!

:::info Try This
Edit this text and see the live preview update instantly!
:::

### Custom Extensions

Our library includes several built-in extensions:

:::warning Important
These extensions make your content more engaging and interactive.
:::

:::success Pro Tip  
You can create custom extensions for your specific needs.
:::

### Code Example

\`\`\`javascript
import { MarkdownRenderer } from '@changerawr/markdown/react';

function App() {
  return <MarkdownRenderer content="# Hello World!" />;
}
\`\`\`

Want to learn more? Check out our documentation!
`;

function MarkdownEditor() {
    const [content, setContent] = useState(SAMPLE_CONTENT);
    const [showPreview, setShowPreview] = useState(true);
    const [format, setFormat] = useState<'tailwind' | 'html'>('tailwind');

    // Using the markdown hook for additional control
    const { html, tokens, isLoading, error } = useMarkdown(content, {
        format,
        debug: false
    });

    const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    }, []);

    const downloadMarkdown = useCallback(() => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        a.click();
        URL.revokeObjectURL(url);
    }, [content]);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(html);
            alert('HTML copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [html]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Markdown Editor Demo
                        </h1>

                        <div className="flex items-center gap-4">
                            {/* Format Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setFormat('tailwind')}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        format === 'tailwind'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Tailwind
                                </button>
                                <button
                                    onClick={() => setFormat('html')}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        format === 'html'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    HTML
                                </button>
                            </div>

                            {/* Preview Toggle */}
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4">
                <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Editor Panel */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-medium text-gray-900">Markdown Source</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={downloadMarkdown}
                                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                >
                                    Download
                                </button>
                                <span className="text-sm text-gray-500">
                  {content.length} chars
                </span>
                            </div>
                        </div>

                        <textarea
                            value={content}
                            onChange={handleContentChange}
                            className="w-full h-96 p-4 font-mono text-sm border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Start typing your markdown here..."
                            spellCheck={false}
                        />
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="font-medium text-gray-900">Live Preview</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                    >
                                        Copy HTML
                                    </button>
                                    <span className="text-sm text-gray-500">
                    {tokens.length} tokens
                  </span>
                                </div>
                            </div>

                            <div className="p-4 h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                                    </div>
                                ) : error ? (
                                    <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                                        Error: {error.message}
                                    </div>
                                ) : (
                                    <MarkdownRenderer
                                        content={content}
                                        format={format}
                                        className="prose prose-sm max-w-none"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Panel */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Document Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Characters:</span>
                            <span className="ml-2 font-medium">{content.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Words:</span>
                            <span className="ml-2 font-medium">{content.split(/\s+/).filter(w => w).length}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Lines:</span>
                            <span className="ml-2 font-medium">{content.split('\n').length}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Tokens:</span>
                            <span className="ml-2 font-medium">{tokens.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Alternative simpler component using just the MarkdownRenderer
function SimpleDemo() {
    const [content, setContent] = useState('# Hello World\n\nEdit me!');

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Simple Markdown Demo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Markdown Input</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Rendered Output</label>
                    <div className="h-64 p-3 border rounded-lg overflow-y-auto bg-gray-50">
                        <MarkdownRenderer content={content} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Engine demo showing advanced usage
function EngineDemo() {
    const { toHtml, getExtensions, hasExtension } = useMarkdownEngine();
    const [input, setInput] = useState('# Engine Demo\n\nThis uses the engine hook directly.');

    const html = toHtml(input);
    const extensions = getExtensions();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Engine Hook Demo</h1>

            <div className="mb-4">
                <p>Available extensions: {extensions.join(', ')}</p>
                <p>Has alert extension: {hasExtension('alert') ? 'Yes' : 'No'}</p>
            </div>

            <div className="space-y-4">
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
        />

                <div className="p-3 border rounded-lg bg-gray-50">
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                </div>
            </div>
        </div>
    );
}

// Export the main demo component
export default MarkdownEditor;

// Export other demos for different use cases
export { SimpleDemo, EngineDemo };