import {Extension} from "@/types.ts";

export const LineBreakExtension: Extension = {
    name: 'line-break',
    parseRules: [
        {
            name: 'hard-break-backslash',
            pattern: /\\\s*\n/,
            render: (match) => ({
                type: 'line-break',
                content: '',
                raw: match[0] || ''
            })
        },
        {
            name: 'hard-break-spaces',
            pattern: /  +\n/,
            render: (match) => ({
                type: 'line-break',
                content: '',
                raw: match[0] || ''
            })
        }
    ],
    renderRules: [
        {
            type: 'line-break',
            render: () => '<br>'
        },
        {
            type: 'paragraph-break',
            render: () => '</p><p>'
        },
        {
            type: 'soft-break',
            render: (token) => token.content || ' '
        }
    ]
};