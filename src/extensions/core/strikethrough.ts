import type { Extension } from '../../types';
import { escapeHtml } from '../../utils';

export const StrikethroughExtension: Extension = {
    name: 'strikethrough',
    parseRules: [
        {
            name: 'strikethrough',
            pattern: /~~((?:(?!~~).)+)~~/,
            render: (match) => ({
                type: 'strikethrough',
                content: match[1] || '',
                raw: match[0] || ''
            })
        }
    ],
    renderRules: [
        {
            type: 'strikethrough',
            render: (token) => {
                const content = escapeHtml(token.content);
                const format = token.attributes?.format;

                if (format === 'html') {
                    return `<del style="text-decoration: line-through; color: #6b7280;">${content}</del>`;
                }
                // Default to Tailwind
                return `<del class="line-through text-gray-500">${content}</del>`;
            }
        }
    ]
};
