/**
 * Tailwind CSS plugin for @changerawr/markdown
 * Ensures all necessary classes are available for markdown rendering
 */

import plugin from 'tailwindcss/plugin';

export interface ChangerawrMarkdownPluginOptions {
    /** Prefix for all markdown classes (default: none) */
    prefix?: string;
    /** Whether to include dark mode variants (default: true) */
    darkMode?: boolean;
    /** Custom color scheme */
    colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        info?: string;
        warning?: string;
        error?: string;
        success?: string;
    };
    /** Whether to include extension styles (alerts, buttons, etc.) */
    includeExtensions?: boolean;
}

export const changerawrMarkdownPlugin = plugin.withOptions<ChangerawrMarkdownPluginOptions>(
    (options = {}) =>
        ({ addUtilities, addComponents }) => {
            const {
                prefix = '',
                darkMode = true,
                colors = {},
                includeExtensions = true
            } = options;

            const prefixClass = (className: string) => prefix ? `${prefix}-${className}` : className;

            // Base typography utilities that might be missing
            addUtilities({
                // Heading utilities
                [`.${prefixClass('text-3xl')}`]: {
                    fontSize: '1.875rem',
                    lineHeight: '2.25rem'
                },
                [`.${prefixClass('text-2xl')}`]: {
                    fontSize: '1.5rem',
                    lineHeight: '2rem'
                },
                [`.${prefixClass('text-xl')}`]: {
                    fontSize: '1.25rem',
                    lineHeight: '1.75rem'
                },
                [`.${prefixClass('text-lg')}`]: {
                    fontSize: '1.125rem',
                    lineHeight: '1.75rem'
                },

                // Font weights
                [`.${prefixClass('font-bold')}`]: {
                    fontWeight: '700'
                },
                [`.${prefixClass('font-semibold')}`]: {
                    fontWeight: '600'
                },
                [`.${prefixClass('font-medium')}`]: {
                    fontWeight: '500'
                },

                // Spacing utilities commonly used in markdown
                [`.${prefixClass('mt-8')}`]: { marginTop: '2rem' },
                [`.${prefixClass('mt-6')}`]: { marginTop: '1.5rem' },
                [`.${prefixClass('mt-4')}`]: { marginTop: '1rem' },
                [`.${prefixClass('mb-8')}`]: { marginBottom: '2rem' },
                [`.${prefixClass('mb-6')}`]: { marginBottom: '1.5rem' },
                [`.${prefixClass('mb-4')}`]: { marginBottom: '1rem' },
                [`.${prefixClass('mb-2')}`]: { marginBottom: '0.5rem' },

                // Layout utilities
                [`.${prefixClass('leading-7')}`]: { lineHeight: '1.75rem' },
                [`.${prefixClass('leading-relaxed')}`]: { lineHeight: '1.625' },

                // Border and padding for blockquotes/code
                [`.${prefixClass('pl-4')}`]: { paddingLeft: '1rem' },
                [`.${prefixClass('pl-6')}`]: { paddingLeft: '1.5rem' },
                [`.${prefixClass('py-2')}`]: { paddingTop: '0.5rem', paddingBottom: '0.5rem' },
                [`.${prefixClass('px-2')}`]: { paddingLeft: '0.5rem', paddingRight: '0.5rem' },
                [`.${prefixClass('px-4')}`]: { paddingLeft: '1rem', paddingRight: '1rem' },
                [`.${prefixClass('p-4')}`]: { padding: '1rem' },
                [`.${prefixClass('p-6')}`]: { padding: '1.5rem' },

                // Border utilities
                [`.${prefixClass('border-l-2')}`]: { borderLeftWidth: '2px' },
                [`.${prefixClass('border-l-4')}`]: { borderLeftWidth: '4px' },
                [`.${prefixClass('rounded')}`]: { borderRadius: '0.25rem' },
                [`.${prefixClass('rounded-lg')}`]: { borderRadius: '0.5rem' },

                // Background colors for code blocks
                [`.${prefixClass('bg-gray-50')}`]: { backgroundColor: '#f9fafb' },
                [`.${prefixClass('bg-gray-100')}`]: { backgroundColor: '#f3f4f6' },
                [`.${prefixClass('bg-gray-900')}`]: { backgroundColor: '#111827' },

                // Text colors
                [`.${prefixClass('text-gray-100')}`]: { color: '#f3f4f6' },
                [`.${prefixClass('text-gray-700')}`]: { color: '#374151' },
                [`.${prefixClass('text-gray-800')}`]: { color: '#1f2937' },

                // Display utilities
                [`.${prefixClass('overflow-x-auto')}`]: { overflowX: 'auto' },
                [`.${prefixClass('font-mono')}`]: { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
                [`.${prefixClass('italic')}`]: { fontStyle: 'italic' },
                [`.${prefixClass('underline')}`]: { textDecoration: 'underline' },

                // Flexbox utilities for headings with anchors
                [`.${prefixClass('group')}`]: { /* group parent class */ },
                [`.${prefixClass('relative')}`]: { position: 'relative' },
                [`.${prefixClass('flex')}`]: { display: 'flex' },
                [`.${prefixClass('items-center')}`]: { alignItems: 'center' },
                [`.${prefixClass('gap-2')}`]: { gap: '0.5rem' },
                [`.${prefixClass('opacity-0')}`]: { opacity: '0' },
                [`.${prefixClass('transition-opacity')}`]: {
                    transitionProperty: 'opacity',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDuration: '150ms'
                },

                // Group hover states
                [`.group:hover .${prefixClass('group-hover:opacity-100')}`]: { opacity: '1' }
            });

            // Extension-specific components
            if (includeExtensions) {
                addComponents({
                    // Alert components
                    [`.${prefixClass('changerawr-alert')}`]: {
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid',
                        marginBottom: '1rem',

                        '&[role="alert"]': {
                            position: 'relative'
                        }
                    },

                    // Alert variants
                    [`.${prefixClass('changerawr-alert-info')}`]: {
                        backgroundColor: colors.info ? `${colors.info}10` : 'rgb(59 130 246 / 0.1)',
                        borderColor: colors.info ? `${colors.info}30` : 'rgb(59 130 246 / 0.3)',
                        color: colors.info || '#1e40af'
                    },

                    [`.${prefixClass('changerawr-alert-warning')}`]: {
                        backgroundColor: colors.warning ? `${colors.warning}10` : 'rgb(245 158 11 / 0.1)',
                        borderColor: colors.warning ? `${colors.warning}30` : 'rgb(245 158 11 / 0.3)',
                        color: colors.warning || '#92400e'
                    },

                    [`.${prefixClass('changerawr-alert-error')}`]: {
                        backgroundColor: colors.error ? `${colors.error}10` : 'rgb(239 68 68 / 0.1)',
                        borderColor: colors.error ? `${colors.error}30` : 'rgb(239 68 68 / 0.3)',
                        color: colors.error || '#dc2626'
                    },

                    [`.${prefixClass('changerawr-alert-success')}`]: {
                        backgroundColor: colors.success ? `${colors.success}10` : 'rgb(34 197 94 / 0.1)',
                        borderColor: colors.success ? `${colors.success}30` : 'rgb(34 197 94 / 0.3)',
                        color: colors.success || '#16a34a'
                    },

                    // Button components
                    [`.${prefixClass('changerawr-button')}`]: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        textDecoration: 'none',

                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }
                    },

                    [`.${prefixClass('changerawr-button-primary')}`]: {
                        backgroundColor: colors.primary || '#3b82f6',
                        color: '#ffffff',

                        '&:hover': {
                            backgroundColor: colors.primary ? `${colors.primary}dd` : '#2563eb'
                        }
                    },

                    [`.${prefixClass('changerawr-button-secondary')}`]: {
                        backgroundColor: '#f3f4f6',
                        color: '#374151',

                        '&:hover': {
                            backgroundColor: '#e5e7eb'
                        }
                    },

                    // Button sizes
                    [`.${prefixClass('changerawr-button-sm')}`]: {
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem'
                    },

                    [`.${prefixClass('changerawr-button-md')}`]: {
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem'
                    },

                    [`.${prefixClass('changerawr-button-lg')}`]: {
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem'
                    }
                });
            }

            // Dark mode variants
            if (darkMode) {
                addUtilities({
                    [`.dark .${prefixClass('dark:bg-gray-800')}`]: { backgroundColor: '#1f2937' },
                    [`.dark .${prefixClass('dark:text-gray-100')}`]: { color: '#f3f4f6' },
                    [`.dark .${prefixClass('dark:text-gray-300')}`]: { color: '#d1d5db' },
                    [`.dark .${prefixClass('dark:border-gray-600')}`]: { borderColor: '#4b5563' }
                });
            }
        }
);

// Default export for easier importing
export default changerawrMarkdownPlugin;