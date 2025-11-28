import {escapeHtml} from "@/utils.ts";
import {Extension} from "@/types.ts";

export const ListExtension: Extension = {
    name: 'list',
    parseRules: [
        {
            name: 'unordered-list-item',
            pattern: /^(\s*)[-*+]\s+(.+)$/m,
            render: (match) => ({
                type: 'list-item',
                content: match[2] || '',
                raw: match[0] || '',
                attributes: {
                    indent: match[1]?.length || 0,
                    ordered: false,
                    marker: match[1] ? match[0].match(/[-*+]/)?.[0] : '-'
                }
            })
        },
        {
            name: 'ordered-list-item',
            pattern: /^(\s*)(\d+)\.\s+(.+)$/m,
            render: (match) => ({
                type: 'ordered-list-item',
                content: match[3] || '',
                raw: match[0] || '',
                attributes: {
                    indent: match[1]?.length || 0,
                    ordered: true,
                    number: parseInt(match[2] || '1')
                }
            })
        }
    ],
    renderRules: [
        {
            type: 'ul',
            render: (token) => {
                const format = token.attributes?.format || 'tailwind';
                const content = token.attributes?.renderedChildren || '';

                if (format === 'html') {
                    return `<ul style="margin: 8px 0; padding-left: 24px; list-style: disc;">${content}</ul>`;
                }
                return `<ul class="my-2 pl-6 list-disc">${content}</ul>`;
            }
        },
        {
            type: 'ol',
            render: (token) => {
                const format = token.attributes?.format || 'tailwind';
                const content = token.attributes?.renderedChildren || '';

                if (format === 'html') {
                    return `<ol style="margin: 8px 0; padding-left: 24px; list-style: decimal;">${content}</ol>`;
                }
                return `<ol class="my-2 pl-6 list-decimal">${content}</ol>`;
            }
        },
        {
            type: 'list-item',
            render: (token) => {
                const format = token.attributes?.format || 'tailwind';
                // If children have been rendered (from recursive parsing), use them
                const content = token.attributes?.renderedChildren || escapeHtml(token.content);

                if (format === 'html') {
                    return `<li>${content}</li>`;
                }
                // Default to Tailwind
                return `<li>${content}</li>`;
            }
        },
        {
            type: 'ordered-list-item',
            render: (token) => {
                const format = token.attributes?.format || 'tailwind';
                const content = token.attributes?.renderedChildren || escapeHtml(token.content);

                if (format === 'html') {
                    return `<li>${content}</li>`;
                }
                return `<li>${content}</li>`;
            }
        }
    ]
};

export const TaskListExtension: Extension = {
    name: 'task-list',
    parseRules: [
        {
            name: 'task-item',
            pattern: /^(\s*)-\s*\[([ xX])\]\s*(.+)$/m,
            render: (match) => ({
                type: 'task-item',
                content: match[3] || '',
                raw: match[0] || '',
                attributes: {
                    indent: match[1]?.length || 0,
                    checked: String((match[2] || '').toLowerCase() === 'x')
                }
            })
        }
    ],
    renderRules: [
        {
            type: 'task-item',
            render: (token) => {
                const isChecked = token.attributes?.checked === 'true';
                // If children have been rendered (from recursive parsing), use them
                const content = token.attributes?.renderedChildren || escapeHtml(token.content);
                const format = token.attributes?.format || 'html';

                const checkmark = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                const checkbox = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`;

                if (format === 'html') {
                    return `<div style="display: flex; align-items: flex-start; gap: 8px; margin: 8px 0;">
            <div style="color: ${isChecked ? '#10b981' : '#9ca3af'}; margin-top: 2px;">
              ${isChecked ? checkmark : checkbox}
            </div>
            <span${isChecked ? ' style="text-decoration: line-through; color: #6b7280;"' : ''}>${content}</span>
          </div>`;
                }

                return `<div class="flex items-start gap-2 my-2 task-list-item">
          <div class="${isChecked ? 'text-green-600' : 'text-gray-400'} flex-shrink-0 mt-0.5">
            ${isChecked ? checkmark : checkbox}
          </div>
          <span${isChecked ? ' class="line-through text-muted-foreground"' : ''}>${content}</span>
        </div>`;
            }
        }
    ]
};