import {escapeHtml} from "@/utils.ts";
import {Extension} from "@/types.ts";

export const ImageExtension: Extension = {
    name: 'image',
    parseRules: [
        {
            name: 'image',
            pattern: /!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]+)")?\)/,
            render: (match) => ({
                type: 'image',
                content: match[1] || '',
                raw: match[0] || '',
                attributes: {
                    alt: match[1] || '',
                    src: match[2] || '',
                    title: match[3] || ''
                }
            })
        }
    ],
    renderRules: [
        {
            type: 'image',
            render: (token) => {
                const src = token.attributes?.src || '';
                const alt = token.attributes?.alt || '';
                const title = token.attributes?.title || '';
                const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
                const format = token.attributes?.format || 'html';

                if (format === 'html') {
                    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" loading="lazy" />`;
                }

                return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} class="max-w-full h-auto rounded-lg my-4" loading="lazy" />`;
            }
        }
    ]
};