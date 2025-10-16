import type { Extension } from '../../types';
import { escapeHtml } from '../../utils';

export const TextExtension: Extension = {
    name: 'text',
    parseRules: [],
    renderRules: [
        {
            type: 'text',
            render: (token) => {
                if (!token.content) return '';
                return escapeHtml(token.content);
            }
        }
    ]
};