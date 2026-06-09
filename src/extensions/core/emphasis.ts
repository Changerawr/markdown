import type { Extension } from '../../types';
import { escapeHtml } from '../../utils';

export const BoldExtension: Extension = {
    name: 'bold',
    parseRules: [
        {
            name: 'bold',
            pattern: /\*\*((?:(?!\*\*).)+)\*\*/,
            recursiveContent: true,
            render: (match) => ({
                type: 'bold',
                content: match[1] || '',
                raw: match[0] || ''
            })
        }
    ],
    renderRules: [
        {
            type: 'bold',
            render: (token) => {
                const content = (token.attributes?.renderedChildren as string) || escapeHtml(token.content);
                const format = token.attributes?.format;

                if (format === 'html') {
                    return `<strong>${content}</strong>`;
                }
                // Default to Tailwind
                return `<strong class="font-bold">${content}</strong>`;
            }
        }
    ]
};

export const ItalicExtension: Extension = {
    name: 'italic',
    parseRules: [
        {
            name: 'italic',
            pattern: /\*((?:(?!\*).)+)\*/,
            recursiveContent: true,
            render: (match) => ({
                type: 'italic',
                content: match[1] || '',
                raw: match[0] || ''
            })
        }
    ],
    renderRules: [
        {
            type: 'italic',
            render: (token) => {
                const content = (token.attributes?.renderedChildren as string) || escapeHtml(token.content);
                const format = token.attributes?.format;

                if (format === 'html') {
                    return `<em>${content}</em>`;
                }
                // Default to Tailwind
                return `<em class="italic">${content}</em>`;
            }
        }
    ]
};