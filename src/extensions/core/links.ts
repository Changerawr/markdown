import type { Extension } from '../../types';
import { escapeHtml } from '../../utils';

export const LinkExtension: Extension = {
    name: 'link',
    parseRules: [
        {
            name: 'link',
            pattern: /\[(?!(?:button|embed):)([^\]]+)\]\(([^)]+)\)/,
            render: (match) => ({
                type: 'link',
                content: match[1] || '',
                raw: match[0] || '',
                attributes: {
                    href: match[2] || ''
                }
            })
        }
    ],
    renderRules: [
        {
            type: 'link',
            render: (token) => {
                const href = token.attributes?.href || '#';
                const escapedHref = escapeHtml(href);
                const escapedText = escapeHtml(token.content);
                const format = token.attributes?.format || 'html';

                if (format === 'html') {
                    return `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer">${escapedText}</a>`;
                }

                return `<a href="${escapedHref}" class="text-primary hover:underline inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
          ${escapedText}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>`;
            }
        }
    ]
};