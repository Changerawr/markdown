import {Extension} from "@/types.ts";
import {escapeHtml} from "@/utils.ts";

export const ParagraphExtension: Extension = {
    name: 'paragraph',
    parseRules: [],
    renderRules: [
        {
            type: 'paragraph',
            render: (token) => {
                if (!token.content) return '';
                const content = token.content.trim();
                if (!content) return '';

                const processedContent = content.includes('<br>') ? content : escapeHtml(content);
                const format = token.attributes?.format || 'html';

                if (format === 'html') {
                    return `<p style="line-height: 1.75; margin-bottom: 16px;">${processedContent}</p>`;
                }

                return `<p class="leading-7 mb-4">${processedContent}</p>`;
            }
        }
    ]
};