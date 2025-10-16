import type { Extension } from '../../types';
import { escapeHtml, generateId } from '../../utils';

export const HeadingExtension: Extension = {
    name: 'heading',
    parseRules: [
        {
            name: 'heading',
            pattern: /^(#{1,6})\s+(.+)$/m,
            render: (match) => ({
                type: 'heading',
                content: match[2]?.trim() || '',
                raw: match[0] || '',
                attributes: {
                    level: String(match[1]?.length || 1)
                }
            })
        }
    ],
    renderRules: [
        {
            type: 'heading',
            render: (token) => {
                const level = parseInt(token.attributes?.level || '1');
                const text = token.content;
                const id = generateId(text);
                const escapedContent = escapeHtml(text);

                // Default to HTML format, extensions can override
                const format = token.attributes?.format || 'html';

                if (format === 'html') {
                    return `<h${level} id="${id}">${escapedContent}</h${level}>`;
                }

                // Tailwind format
                let headingClasses = 'group relative flex items-center gap-2';

                switch (level) {
                    case 1: headingClasses += ' text-3xl font-bold mt-8 mb-4'; break;
                    case 2: headingClasses += ' text-2xl font-semibold mt-6 mb-3'; break;
                    case 3: headingClasses += ' text-xl font-medium mt-5 mb-3'; break;
                    case 4: headingClasses += ' text-lg font-medium mt-4 mb-2'; break;
                    case 5: headingClasses += ' text-base font-medium mt-3 mb-2'; break;
                    case 6: headingClasses += ' text-sm font-medium mt-3 mb-2'; break;
                }

                return `<h${level} id="${id}" class="${headingClasses}">
          ${escapedContent}
          <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
</svg>
          </a>
        </h${level}>`;
            }
        }
    ]
};