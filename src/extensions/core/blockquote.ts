import {escapeHtml} from "@/utils.ts";
import {Extension} from "@/types.ts";

export const BlockquoteExtension: Extension = {
    name: 'blockquote',
    parseRules: [
        {
            name: 'blockquote',
            pattern: /^>\s+(.+)$/m,
            render: (match) => ({
                type: 'blockquote',
                content: match[1] || '',
                raw: match[0] || ''
            })
        }
    ],
    renderRules: [
        {
            type: 'blockquote',
            render: (token) => {
                const renderMarkdown = token.attributes?.renderMarkdown as ((md: string) => string) | undefined;
                const format = token.attributes?.format || 'html';

                // Render the content as markdown if we have the callback, otherwise escape it
                const content = renderMarkdown ? renderMarkdown(token.content) : escapeHtml(token.content);

                if (format === 'html') {
                    return `<blockquote style="border-left: 2px solid #d1d5db; padding: 8px 0 8px 16px; margin: 16px 0; font-style: italic; color: #6b7280;">${content}</blockquote>`;
                }
                return `<blockquote class="pl-4 py-2 border-l-2 border-border italic text-muted-foreground my-4">${content}</blockquote>`;
            }
        }
    ]
};