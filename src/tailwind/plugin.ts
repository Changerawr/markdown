/**
 * Tailwind CSS safelist plugin for @changerawr/markdown
 *
 * This plugin ensures standard Tailwind classes used by markdown rendering
 * are included in the final CSS build and not purged.
 *
 */

import plugin from 'tailwindcss/plugin';

export interface ChangerawrMarkdownPluginOptions {
    /** Whether to include extension classes for alerts and buttons (default: true) */
    includeExtensions?: boolean;
    /** Whether to include dark mode variants (default: true) */
    darkMode?: boolean;
}

/**
 * Core Tailwind classes used by markdown components
 */
const CORE_CLASSES = [
    // Typography
    'text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm',
    'font-bold', 'font-semibold', 'font-medium',
    'italic', 'underline', 'line-through',
    'leading-7', 'leading-relaxed',

    // Spacing
    'mt-8', 'mt-6', 'mt-5', 'mt-4', 'mt-3',
    'mb-6', 'mb-4', 'mb-3', 'mb-2',
    'my-6', 'my-4',
    'p-4', 'p-6',
    'px-1.5', 'px-2', 'px-3', 'px-4',
    'py-0.5', 'py-1', 'py-2',
    'pl-4', 'pl-6',

    // Layout
    'flex', 'inline-flex', 'items-center', 'justify-center',
    'gap-2', 'space-y-1',
    'list-disc', 'list-inside', 'ml-4',

    // Borders and backgrounds
    'border-l-2', 'border-l-4',
    'rounded', 'rounded-lg', 'rounded-md',
    'bg-muted',

    // Images
    'max-w-full', 'h-auto', 'overflow-x-auto',

    // Interactions
    'hover:underline', 'transition-all', 'duration-200',
    'cursor-pointer'
];

/**
 * Extension classes for alerts and buttons
 */
const EXTENSION_CLASSES = [
    // Alert colors (using opacity syntax)
    'bg-blue-500/10', 'border-blue-500/30', 'text-blue-600', 'border-l-blue-500',
    'bg-amber-500/10', 'border-amber-500/30', 'text-amber-600', 'border-l-amber-500',
    'bg-red-500/10', 'border-red-500/30', 'text-red-600', 'border-l-red-500',
    'bg-green-500/10', 'border-green-500/30', 'text-green-600', 'border-l-green-500',

    // Button variants
    'bg-blue-600', 'text-white', 'hover:bg-blue-700',
    'bg-gray-200', 'text-gray-900', 'hover:bg-gray-300'
];

/**
 * Dark mode variants
 */
const DARK_MODE_CLASSES = [
    'dark:text-blue-400', 'dark:text-amber-400', 'dark:text-red-400', 'dark:text-green-400',
    'dark:bg-gray-800', 'dark:text-gray-100'
];

export const changerawrMarkdownPlugin = plugin.withOptions<ChangerawrMarkdownPluginOptions>(
    (options = {}) => ({ addUtilities }) => {
        const { includeExtensions = true, darkMode = true } = options;

        let allClasses = [...CORE_CLASSES];

        if (includeExtensions) {
            allClasses.push(...EXTENSION_CLASSES);
        }

        if (darkMode) {
            allClasses.push(...DARK_MODE_CLASSES);
        }

        // Create hidden utilities that reference the classes
        // This ensures Tailwind includes them in the final CSS
        const preserveRules = allClasses.reduce((acc, className) => {
            const safeClassName = className.replace(/[^a-zA-Z0-9]/g, '-');
            acc[`.changerawr-preserve-${safeClassName}`] = {
                // Use CSS custom properties to reference the class without creating actual styles
                '--tw-preserve': `"${className}"`
            };
            return acc;
        }, {} as Record<string, Record<string, string>>);

        addUtilities(preserveRules);
    }
);

export default changerawrMarkdownPlugin;