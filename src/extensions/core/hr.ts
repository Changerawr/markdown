import {Extension} from "@/types.ts";

export const HorizontalRuleExtension: Extension = {
    name: 'hr',
    parseRules: [
        {
            name: 'hr',
            pattern: /^---$/m,
            render: (match) => ({
                type: 'hr',
                content: '',
                raw: match[0] || ''
            })
        }
    ],
    renderRules: [
        {
            type: 'hr',
            render: (token) => {
                const format = token.attributes?.format;

                if (format === 'html') {
                    return '<hr style="margin: 24px 0; border: none; border-top: 1px solid #d1d5db;">';
                }
                // Default to Tailwind
                return '<hr class="my-6 border-t border-border">';
            }
        }
    ]
};