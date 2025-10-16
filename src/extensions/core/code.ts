import type { Extension } from '../../types';
import { escapeHtml } from '../../utils';

export const InlineCodeExtension: Extension = {
    name: 'inline-code',
    parseRules: [
        {
            name: 'code',
            pattern: /`([^`]+)`/,
            render: (match) => ({
                type: 'code',
                content: match[1] || '',
                raw: match[0] || ''
            })
        }
    ],
    renderRules: [
        {
            type: 'code',
            render: (token) => {
                const content = escapeHtml(token.content);
                const format = token.attributes?.format;

                if (format === 'html') {
                    return `<code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.875rem;">${content}</code>`;
                }
                // Default to Tailwind
                return `<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">${content}</code>`;
            }
        }
    ]
};

export const CodeBlockExtension: Extension = {
    name: 'codeblock',
    parseRules: [
        {
            name: 'codeblock',
            pattern: /```(\w+)?\s*\n([\s\S]*?)\n```/,
            render: (match) => ({
                type: 'codeblock',
                content: match[2] || '',
                raw: match[0] || '',
                attributes: {
                    language: match[1] || 'text'
                }
            })
        }
    ],
    renderRules: [
        {
            type: 'codeblock',
            render: (token) => {
                const language = token.attributes?.language || 'text';
                const escapedCode = escapeHtml(token.content);
                const format = token.attributes?.format || 'html';

                if (format === 'html') {
                    return `<pre style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 16px 0;"><code class="language-${escapeHtml(language)}">${escapedCode}</code></pre>`;
                }

                return `<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code class="language-${escapeHtml(language)}">${escapedCode}</code></pre>`;
            }
        }
    ]
};