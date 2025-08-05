import type { Extension } from '../types';

export const ButtonExtension: Extension = {
    name: 'button',
    parseRules: [
        {
            name: 'button',
            pattern: /\[button:([^\]]+)\]\(([^)]+)\)(?:\{([^}]+)\})?/,
            render: (match) => {
                const text = match[1] || '';
                const href = match[2] || '';
                const optionsString = match[3] || '';

                // Parse options
                const options = optionsString.split(',').map(opt => opt.trim()).filter(Boolean);

                // Determine style
                const styleOptions = ['default', 'primary', 'secondary', 'success', 'danger', 'outline', 'ghost'];
                const style = options.find(opt => styleOptions.includes(opt)) || 'primary';

                // Determine size
                const sizeOptions = ['sm', 'md', 'lg'];
                const size = options.find(opt => sizeOptions.includes(opt)) || 'md';

                // Determine other options
                const disabled = options.includes('disabled');
                const target = options.includes('self') ? '_self' : '_blank';

                return {
                    type: 'button',
                    content: text,
                    raw: match[0] || '',
                    attributes: {
                        href,
                        style,
                        size,
                        disabled: disabled.toString(),
                        target
                    }
                };
            }
        }
    ],
    renderRules: [
        {
            type: 'button',
            render: (token) => {
                const href = token.attributes?.href || '#';
                const style = token.attributes?.style || 'primary';
                const size = token.attributes?.size || 'md';
                const disabled = token.attributes?.disabled === 'true';
                const target = token.attributes?.target || '_blank';
                const text = token.content;

                // Build CSS classes
                const classes = buildButtonClasses(style, size);

                // Build attributes
                const targetAttr = target === '_blank'
                    ? ' target="_blank" rel="noopener noreferrer"'
                    : target === '_self'
                        ? ' target="_self"'
                        : '';
                const disabledAttr = disabled ? ' aria-disabled="true" tabindex="-1"' : '';

                // Add external link icon only for _blank targets that aren't disabled
                const externalIcon = target === '_blank' && !disabled
                    ? '<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>'
                    : '';

                return `<a href="${href}" class="${classes}"${targetAttr}${disabledAttr}>
          ${text}${externalIcon}
        </a>`;
            }
        }
    ]
};

function buildButtonClasses(style: string, size: string): string {
    // Base classes
    const base = [
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-lg',
        'transition-colors',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
    ];

    // Size classes
    const sizes: Record<string, string[]> = {
        sm: ['px-3', 'py-1.5', 'text-sm'],
        md: ['px-4', 'py-2', 'text-base'],
        lg: ['px-6', 'py-3', 'text-lg']
    };

    // Style classes
    const styles: Record<string, string[]> = {
        default: ['bg-slate-600', 'text-white', 'hover:bg-slate-700', 'focus:ring-slate-500'],
        primary: ['bg-blue-600', 'text-white', 'hover:bg-blue-700', 'focus:ring-blue-500'],
        secondary: ['bg-gray-600', 'text-white', 'hover:bg-gray-700', 'focus:ring-gray-500'],
        success: ['bg-green-600', 'text-white', 'hover:bg-green-700', 'focus:ring-green-500'],
        danger: ['bg-red-600', 'text-white', 'hover:bg-red-700', 'focus:ring-red-500'],
        outline: ['border', 'border-blue-600', 'text-blue-600', 'hover:bg-blue-50', 'focus:ring-blue-500'],
        ghost: ['text-gray-700', 'hover:bg-gray-100', 'focus:ring-gray-500']
    };

    // Combine all classes
    const allClasses = [
        ...base,
        ...(sizes[size] ?? sizes.md ?? []),
        ...(styles[style] ?? styles.primary ?? [])
    ];

    return allClasses.join(' ');
}

// Usage examples:
// [button:Click Me](https://example.com){primary}
// [button:Download](./file.pdf){success,lg}
// [button:Cancel](javascript:void(0)){outline,sm}
// [button:Disabled Button](#){danger,disabled}
// [button:Same Tab](https://example.com){primary,self}
// [button:Ghost Button](#){ghost,md}