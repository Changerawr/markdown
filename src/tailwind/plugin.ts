/**
 * Tailwind CSS plugin for @changerawr/markdown
 *
 * This plugin provides safelist configuration to ensure all dynamically-generated
 * Tailwind classes used by markdown rendering are included in the final CSS build.
 *
 * Works with both Tailwind v3 and v4.
 */

import plugin from 'tailwindcss/plugin';

export interface ChangerawrMarkdownPluginOptions {
    /** Whether to include extension classes for alerts and buttons (default: true) */
    includeExtensions?: boolean;
    /** Whether to include dark mode variants (default: true) */
    darkMode?: boolean;
}

/**
 * Safelist type - compatible with Tailwind v3 and v4
 */
export type Safelist = Array<string | { pattern: RegExp }>;

/**
 * Get safelist configuration for Tailwind
 * Use this in your tailwind.config.js:
 *
 * @example
 * ```js
 * import { getSafelist } from '@changerawr/markdown/tailwind';
 *
 * export default {
 *   safelist: getSafelist(),
 *   // ... other config
 * }
 * ```
 */
export function getSafelist(options: ChangerawrMarkdownPluginOptions = {}): Safelist {
    const { includeExtensions = true, darkMode = true } = options;

    const safelist: Safelist = [
        // Core typography
        'text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm',
        'font-bold', 'font-semibold', 'font-medium',
        'italic', 'underline', 'line-through',
        'leading-7', 'leading-relaxed',

        // Core spacing
        'mt-8', 'mt-6', 'mt-5', 'mt-4', 'mt-3', 'mt-2',
        'mb-6', 'mb-4', 'mb-3', 'mb-2',
        'my-6', 'my-4',
        'p-4', 'p-6',
        'px-1.5', 'px-2', 'px-3', 'px-4', 'px-6',
        'py-0.5', 'py-1', 'py-1.5', 'py-2', 'py-3',
        'pl-4', 'pl-6',
        'ml-1', 'ml-4',

        // Core layout
        'flex', 'inline-flex', 'items-center', 'justify-center',
        'gap-1.5', 'gap-2', 'gap-2.5', 'space-y-1',
        'list-disc', 'list-inside',
        'relative', 'absolute', 'inset-0', 'z-10',
        'overflow-hidden',

        // Core borders and backgrounds
        'border', 'border-transparent', 'border-l-2', 'border-l-4',
        'rounded', 'rounded-lg', 'rounded-md',
        'bg-muted', 'bg-transparent',

        // Core images and overflow
        'max-w-full', 'h-auto', 'w-4', 'h-4',
        'overflow-x-auto',

        // Core interactions and transitions
        'cursor-pointer', 'cursor-not-allowed',
        'hover:underline', 'transition-all', 'transition-colors', 'transition-opacity',
        'duration-200', 'ease-out',
        'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2',
        'transform', 'opacity-50', 'opacity-75',
        'shadow-sm', 'shadow-md', 'hover:shadow-md', 'active:shadow-sm',
    ];

    if (includeExtensions) {
        // Alert color patterns - covers all 6 alert types (info, warning, error, success, tip, note)
        const alertColors = ['blue', 'amber', 'red', 'green', 'purple', 'gray'];

        alertColors.forEach(color => {
            safelist.push(
                `bg-${color}-500/10`,
                `border-${color}-500/30`,
                `text-${color}-600`,
                `border-l-${color}-500`
            );
        });

        // Button color patterns - covers all button styles
        const buttonColors = ['slate', 'blue', 'gray', 'green', 'red'];
        const buttonShades = ['400', '500', '600', '700'];

        buttonColors.forEach(color => {
            buttonShades.forEach(shade => {
                safelist.push(
                    `bg-${color}-${shade}`,
                    `border-${color}-${shade}`,
                    `text-${color}-${shade}`,
                    `hover:bg-${color}-${shade}`,
                    `hover:border-${color}-${shade}`,
                    `hover:text-${color}-${shade}`,
                    `focus:ring-${color}-${shade}`
                );
            });
        });

        // Button background utilities
        safelist.push(
            'text-white',
            'text-gray-700',
            'text-gray-900',
            'bg-blue-50',
            'bg-gray-100',
            'hover:bg-blue-50',
            'hover:bg-gray-100',
            'hover:text-gray-900'
        );

        // Button pseudo-element classes
        safelist.push(
            'before:absolute',
            'before:inset-0',
            'before:rounded-lg',
            'before:bg-gradient-to-br',
            'before:from-white/20',
            'before:to-transparent',
            'before:opacity-0',
            'hover:before:opacity-100',
            'before:transition-opacity',
            'before:duration-200'
        );

        // Button arbitrary values - must be explicitly safelisted
        safelist.push(
            // Transform scales
            { pattern: /^(hover:)?scale-\[1\.02\]$/ },
            { pattern: /^(active:)?scale-\[0\.98\]$/ },

            // Complex box shadows with arbitrary values
            { pattern: /^shadow-\[.*\]$/ },
            { pattern: /^hover:shadow-\[.*\]$/ },
            { pattern: /^active:shadow-\[.*\]$/ },
        );

        // Button disabled states
        safelist.push(
            'disabled:opacity-50',
            'disabled:cursor-not-allowed',
            'disabled:pointer-events-none'
        );
    }

    if (darkMode) {
        safelist.push(
            'dark:text-blue-400',
            'dark:text-amber-400',
            'dark:text-red-400',
            'dark:text-green-400',
            'dark:text-purple-400',
            'dark:text-gray-400',
            'dark:bg-gray-800',
            'dark:text-gray-100'
        );
    }

    return safelist;
}

/**
 * Tailwind plugin for @changerawr/markdown
 *
 * This plugin is a no-op - all functionality is now handled via safelist configuration.
 * The safelist approach is more reliable and works with both Tailwind v3 and v4.
 *
 * For Tailwind v3: Use this plugin AND add getSafelist() to your config
 * For Tailwind v4: Just use getSafelist() in your config
 */
export const changerawrMarkdownPlugin = plugin.withOptions<ChangerawrMarkdownPluginOptions>(
    () => () => {
        // No-op - safelist handles everything
        // The actual safelist should be added via the config's safelist property
    },
    (options = {}) => {
        return {
            safelist: getSafelist(options)
        } as any; // Cast to any for compatibility with different Tailwind versions
    }
);

export default changerawrMarkdownPlugin;