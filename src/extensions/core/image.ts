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
                    caption: match[3] || ''  // Renamed from 'title' to 'caption' for clarity
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
                const caption = token.attributes?.caption || '';
                const format = token.attributes?.format || 'html';

                // If there's a caption, render as figure with figcaption
                if (caption) {
                    if (format === 'html') {
                        return `<figure style="margin: 16px 0; text-align: center;">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy" />
            <figcaption style="margin-top: 8px; font-size: 14px; color: #6b7280; font-style: italic;">${escapeHtml(caption)}</figcaption>
          </figure>`;
                    }
                    return `<figure class="my-4 text-center">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="max-w-full h-auto rounded-lg" loading="lazy" />
            <figcaption class="mt-2 text-sm text-gray-500 italic">${escapeHtml(caption)}</figcaption>
          </figure>`;
                }

                // No caption, just render the image
                if (format === 'html') {
                    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" loading="lazy" />`;
                }

                return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="max-w-full h-auto rounded-lg my-4" loading="lazy" />`;
            }
        }
    ]
};