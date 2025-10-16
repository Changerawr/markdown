import {escapeHtml} from "@/utils.ts";
import {Extension} from "@/types.ts";

export const ListExtension: Extension = {
    name: 'list',
    parseRules: [
        {
            name: 'list-item',
            pattern: /^(\s*)[-*+]\s+(.+)$/m,
            render: (match) => ({
                type: 'list-item',
                content: match[2] || '',
                raw: match[0] || ''
            })
        }
    ],
    renderRules: [
        {
            type: 'list-item',
            render: (token) => `<li>${escapeHtml(token.content)}</li>`
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
                const escapedContent = escapeHtml(token.content);
                const format = token.attributes?.format || 'html';

                if (format === 'html') {
                    return `<div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
            <input type="checkbox" ${isChecked ? 'checked' : ''} disabled style="margin: 0;" />
            <span${isChecked ? ' style="text-decoration: line-through; color: #6b7280;"' : ''}>${escapedContent}</span>
          </div>`;
                }

                return `<div class="flex items-center gap-2 my-2 task-list-item">
          <input type="checkbox" ${isChecked ? 'checked' : ''} disabled 
            class="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <span${isChecked ? ' class="line-through text-muted-foreground"' : ''}>${escapedContent}</span>
        </div>`;
            }
        }
    ]
};