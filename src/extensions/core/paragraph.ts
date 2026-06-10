import {Extension} from "@/types.ts";
import {escapeHtml} from "@/utils.ts";

export const ParagraphExtension: Extension = {
    name: 'paragraph',
    parseRules: [],
    renderRules: [
        {
            type: 'paragraph',
            render: (token) => {
                const content = (token.attributes?.renderedChildren as string) || escapeHtml(token.content || '');
                if (!content.trim()) return '';

                const format = token.attributes?.format || 'html';

                if (format === 'html') {
                    return `<p style="line-height: 1.75; margin-bottom: 16px;">${content}</p>`;
                }

                return `<p class="leading-7 mb-4">${content}</p>`;
            }
        }
    ]
};