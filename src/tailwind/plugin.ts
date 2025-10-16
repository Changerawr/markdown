/**
 * Tailwind CSS plugin for @changerawr/markdown
 * Compatible with both Tailwind v3 and v4
 */

import plugin from 'tailwindcss/plugin';

export interface ChangerawrMarkdownPluginOptions {
    /** Prefix for all markdown classes (default: none) */
    prefix?: string;
    /** Whether to include dark mode variants (default: true) */
    darkMode?: boolean;
    /** Custom color palette */
    colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        info?: string;
        warning?: string;
        error?: string;
        success?: string;
        muted?: string;
        border?: string;
    };
    /** Whether to include extension styles (alerts, buttons, etc.) */
    includeExtensions?: boolean;
    /** Custom class overrides */
    customClasses?: Record<string, string>;
}

const defaultColors = {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#8b5cf6',
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
    success: '#10b981',
    muted: '#6b7280',
    border: '#d1d5db',
};

export const changerawrMarkdownPlugin = plugin.withOptions<ChangerawrMarkdownPluginOptions>(
    (options = {}) =>
        ({ addUtilities, addComponents }) => {
            const {
                prefix = '',
                darkMode = true,
                colors = {},
                includeExtensions = true,
                customClasses = {},
            } = options;

            const mergedColors = { ...defaultColors, ...colors };
            const prefixClass = (className: string) => (prefix ? `${prefix}-${className}` : className);

            // Base typography utilities
            addUtilities({
                // Essential typography classes for markdown
                [`.${prefixClass('changerawr-text-3xl')}`]: {
                    fontSize: '1.875rem',
                    lineHeight: '2.25rem',
                },
                [`.${prefixClass('changerawr-text-2xl')}`]: {
                    fontSize: '1.5rem',
                    lineHeight: '2rem',
                },
                [`.${prefixClass('changerawr-text-xl')}`]: {
                    fontSize: '1.25rem',
                    lineHeight: '1.75rem',
                },
                [`.${prefixClass('changerawr-text-lg')}`]: {
                    fontSize: '1.125rem',
                    lineHeight: '1.75rem',
                },
                [`.${prefixClass('changerawr-font-bold')}`]: {
                    fontWeight: '700',
                },
                [`.${prefixClass('changerawr-font-semibold')}`]: {
                    fontWeight: '600',
                },
                [`.${prefixClass('changerawr-font-medium')}`]: {
                    fontWeight: '500',
                },
                [`.${prefixClass('changerawr-italic')}`]: {
                    fontStyle: 'italic',
                },
                [`.${prefixClass('changerawr-underline')}`]: {
                    textDecoration: 'underline',
                },
                [`.${prefixClass('changerawr-line-through')}`]: {
                    textDecoration: 'line-through',
                },

                // Spacing utilities
                [`.${prefixClass('changerawr-mt-8')}`]: { marginTop: '2rem' },
                [`.${prefixClass('changerawr-mt-6')}`]: { marginTop: '1.5rem' },
                [`.${prefixClass('changerawr-mt-5')}`]: { marginTop: '1.25rem' },
                [`.${prefixClass('changerawr-mt-4')}`]: { marginTop: '1rem' },
                [`.${prefixClass('changerawr-mt-3')}`]: { marginTop: '0.75rem' },
                [`.${prefixClass('changerawr-mb-8')}`]: { marginBottom: '2rem' },
                [`.${prefixClass('changerawr-mb-6')}`]: { marginBottom: '1.5rem' },
                [`.${prefixClass('changerawr-mb-4')}`]: { marginBottom: '1rem' },
                [`.${prefixClass('changerawr-mb-3')}`]: { marginBottom: '0.75rem' },
                [`.${prefixClass('changerawr-mb-2')}`]: { marginBottom: '0.5rem' },
                [`.${prefixClass('changerawr-my-6')}`]: { marginTop: '1.5rem', marginBottom: '1.5rem' },
                [`.${prefixClass('changerawr-my-4')}`]: { marginTop: '1rem', marginBottom: '1rem' },
                [`.${prefixClass('changerawr-my-2')}`]: { marginTop: '0.5rem', marginBottom: '0.5rem' },

                // Padding utilities
                [`.${prefixClass('changerawr-p-4')}`]: { padding: '1rem' },
                [`.${prefixClass('changerawr-p-6')}`]: { padding: '1.5rem' },
                [`.${prefixClass('changerawr-px-2')}`]: { paddingLeft: '0.5rem', paddingRight: '0.5rem' },
                [`.${prefixClass('changerawr-px-3')}`]: { paddingLeft: '0.75rem', paddingRight: '0.75rem' },
                [`.${prefixClass('changerawr-px-4')}`]: { paddingLeft: '1rem', paddingRight: '1rem' },
                [`.${prefixClass('changerawr-px-6')}`]: { paddingLeft: '1.5rem', paddingRight: '1.5rem' },
                [`.${prefixClass('changerawr-py-1')}`]: { paddingTop: '0.25rem', paddingBottom: '0.25rem' },
                [`.${prefixClass('changerawr-py-2')}`]: { paddingTop: '0.5rem', paddingBottom: '0.5rem' },
                [`.${prefixClass('changerawr-py-3')}`]: { paddingTop: '0.75rem', paddingBottom: '0.75rem' },
                [`.${prefixClass('changerawr-pl-4')}`]: { paddingLeft: '1rem' },
                [`.${prefixClass('changerawr-pl-6')}`]: { paddingLeft: '1.5rem' },

                // Line height and leading
                [`.${prefixClass('changerawr-leading-7')}`]: { lineHeight: '1.75rem' },
                [`.${prefixClass('changerawr-leading-relaxed')}`]: { lineHeight: '1.625' },
                [`.${prefixClass('changerawr-leading-loose')}`]: { lineHeight: '2' },

                // Layout utilities
                [`.${prefixClass('changerawr-flex')}`]: { display: 'flex' },
                [`.${prefixClass('changerawr-inline-flex')}`]: { display: 'inline-flex' },
                [`.${prefixClass('changerawr-items-center')}`]: { alignItems: 'center' },
                [`.${prefixClass('changerawr-justify-center')}`]: { justifyContent: 'center' },
                [`.${prefixClass('changerawr-gap-1')}`]: { gap: '0.25rem' },
                [`.${prefixClass('changerawr-gap-2')}`]: { gap: '0.5rem' },
                [`.${prefixClass('changerawr-gap-3')}`]: { gap: '0.75rem' },
                [`.${prefixClass('changerawr-group')}`]: { /* group parent */ },
                [`.${prefixClass('changerawr-relative')}`]: { position: 'relative' },

                // Border utilities
                [`.${prefixClass('changerawr-border')}`]: { borderWidth: '1px' },
                [`.${prefixClass('changerawr-border-l-2')}`]: { borderLeftWidth: '2px' },
                [`.${prefixClass('changerawr-border-l-4')}`]: { borderLeftWidth: '4px' },
                [`.${prefixClass('changerawr-rounded')}`]: { borderRadius: '0.25rem' },
                [`.${prefixClass('changerawr-rounded-lg')}`]: { borderRadius: '0.5rem' },
                [`.${prefixClass('changerawr-rounded-md')}`]: { borderRadius: '0.375rem' },

                // Background utilities
                [`.${prefixClass('changerawr-bg-gray-50')}`]: { backgroundColor: '#f9fafb' },
                [`.${prefixClass('changerawr-bg-gray-100')}`]: { backgroundColor: '#f3f4f6' },
                [`.${prefixClass('changerawr-bg-gray-900')}`]: { backgroundColor: '#111827' },
                [`.${prefixClass('changerawr-bg-white')}`]: { backgroundColor: '#ffffff' },

                // Text colors
                [`.${prefixClass('changerawr-text-gray-100')}`]: { color: '#f3f4f6' },
                [`.${prefixClass('changerawr-text-gray-600')}`]: { color: '#4b5563' },
                [`.${prefixClass('changerawr-text-gray-700')}`]: { color: '#374151' },
                [`.${prefixClass('changerawr-text-gray-800')}`]: { color: '#1f2937' },
                [`.${prefixClass('changerawr-text-primary')}`]: { color: mergedColors.primary },
                [`.${prefixClass('changerawr-text-muted-foreground')}`]: { color: mergedColors.muted },

                // Border colors
                [`.${prefixClass('changerawr-border-border')}`]: { borderColor: mergedColors.border },

                // Display utilities
                [`.${prefixClass('changerawr-overflow-x-auto')}`]: { overflowX: 'auto' },
                [`.${prefixClass('changerawr-max-w-full')}`]: { maxWidth: '100%' },
                [`.${prefixClass('changerawr-h-auto')}`]: { height: 'auto' },
                [`.${prefixClass('changerawr-font-mono')}`]: {
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                },

                // Opacity and transitions
                [`.${prefixClass('changerawr-opacity-0')}`]: { opacity: '0' },
                [`.${prefixClass('changerawr-transition-opacity')}`]: {
                    transitionProperty: 'opacity',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDuration: '150ms',
                },
                [`.${prefixClass('changerawr-transition-colors')}`]: {
                    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDuration: '150ms',
                },

                // Hover states
                [`.${prefixClass('changerawr-hover\\:underline')}:hover`]: { textDecoration: 'underline' },
                [`.group:hover .${prefixClass('changerawr-group-hover\\:opacity-100')}`]: { opacity: '1' },

                // Shadow utilities
                [`.${prefixClass('changerawr-shadow-sm')}`]: {
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                },

                // Custom markdown classes with overrides
                ...Object.fromEntries(
                    Object.entries(customClasses).map(([key, value]) => [
                        `.${prefixClass(`changerawr-${key}`)}`,
                        typeof value === 'string' ? { className: value } : value,
                    ])
                ),
            });

            // Extension components
            if (includeExtensions) {
                addComponents({
                    // Alert base styles
                    [`.${prefixClass('changerawr-alert')}`]: {
                        borderLeftWidth: '4px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: '0.375rem',
                        transitionProperty: 'color, background-color, border-color',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        transitionDuration: '200ms',
                    },

                    // Alert variants using opacity for compatibility
                    [`.${prefixClass('changerawr-alert-info')}`]: {
                        backgroundColor: `color-mix(in srgb, ${mergedColors.info} 10%, transparent)`,
                        borderColor: `color-mix(in srgb, ${mergedColors.info} 30%, transparent)`,
                        color: mergedColors.info,
                    },

                    [`.${prefixClass('changerawr-alert-warning')}`]: {
                        backgroundColor: `color-mix(in srgb, ${mergedColors.warning} 10%, transparent)`,
                        borderColor: `color-mix(in srgb, ${mergedColors.warning} 30%, transparent)`,
                        color: mergedColors.warning,
                    },

                    [`.${prefixClass('changerawr-alert-error')}`]: {
                        backgroundColor: `color-mix(in srgb, ${mergedColors.error} 10%, transparent)`,
                        borderColor: `color-mix(in srgb, ${mergedColors.error} 30%, transparent)`,
                        color: mergedColors.error,
                    },

                    [`.${prefixClass('changerawr-alert-success')}`]: {
                        backgroundColor: `color-mix(in srgb, ${mergedColors.success} 10%, transparent)`,
                        borderColor: `color-mix(in srgb, ${mergedColors.success} 30%, transparent)`,
                        color: mergedColors.success,
                    },

                    // Button base styles
                    [`.${prefixClass('changerawr-button')}`]: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.5rem',
                        fontWeight: '500',
                        transitionProperty: 'all',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        transitionDuration: '150ms',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        '&:focus': {
                            outline: 'none',
                            ringWidth: '2px',
                            ringOffsetWidth: '2px',
                        },
                        '&:disabled': {
                            opacity: '0.5',
                            cursor: 'not-allowed',
                        },
                    },

                    // Button variants
                    [`.${prefixClass('changerawr-button-primary')}`]: {
                        backgroundColor: mergedColors.primary,
                        color: '#ffffff',
                        '&:hover:not(:disabled)': {
                            backgroundColor: `color-mix(in srgb, ${mergedColors.primary} 90%, black)`,
                        },
                        '&:focus': {
                            ringColor: `color-mix(in srgb, ${mergedColors.primary} 50%, transparent)`,
                        },
                    },

                    [`.${prefixClass('changerawr-button-secondary')}`]: {
                        backgroundColor: mergedColors.secondary,
                        color: '#ffffff',
                        '&:hover:not(:disabled)': {
                            backgroundColor: `color-mix(in srgb, ${mergedColors.secondary} 90%, black)`,
                        },
                        '&:focus': {
                            ringColor: `color-mix(in srgb, ${mergedColors.secondary} 50%, transparent)`,
                        },
                    },

                    [`.${prefixClass('changerawr-button-outline')}`]: {
                        borderColor: mergedColors.primary,
                        color: mergedColors.primary,
                        '&:hover:not(:disabled)': {
                            backgroundColor: `color-mix(in srgb, ${mergedColors.primary} 5%, transparent)`,
                        },
                    },

                    [`.${prefixClass('changerawr-button-ghost')}`]: {
                        color: mergedColors.secondary,
                        '&:hover:not(:disabled)': {
                            backgroundColor: `color-mix(in srgb, ${mergedColors.secondary} 10%, transparent)`,
                        },
                    },

                    // Button sizes
                    [`.${prefixClass('changerawr-button-sm')}`]: {
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem',
                        paddingTop: '0.375rem',
                        paddingBottom: '0.375rem',
                        fontSize: '0.875rem',
                    },

                    [`.${prefixClass('changerawr-button-md')}`]: {
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        fontSize: '0.875rem',
                    },

                    [`.${prefixClass('changerawr-button-lg')}`]: {
                        paddingLeft: '1.5rem',
                        paddingRight: '1.5rem',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                        fontSize: '1rem',
                    },

                    // Embed styles
                    [`.${prefixClass('changerawr-embed')}`]: {
                        borderRadius: '0.5rem',
                        border: '1px solid',
                        borderColor: mergedColors.border,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                        marginBottom: '1.5rem',
                        overflow: 'hidden',
                    },
                });
            }

            // Dark mode variants
            if (darkMode) {
                addUtilities({
                    [`.dark .${prefixClass('changerawr-dark\\:bg-gray-800')}`]: { backgroundColor: '#1f2937' },
                    [`.dark .${prefixClass('changerawr-dark\\:text-gray-100')}`]: { color: '#f3f4f6' },
                    [`.dark .${prefixClass('changerawr-dark\\:text-gray-300')}`]: { color: '#d1d5db' },
                    [`.dark .${prefixClass('changerawr-dark\\:border-gray-600')}`]: { borderColor: '#4b5563' },
                });
            }
        }
);

// CSS-only version for Tailwind v4
export const changerawrMarkdownCSS = (options: ChangerawrMarkdownPluginOptions = {}) => {
    const {
        prefix = '',
        colors = {},
        includeExtensions = true,
    } = options;

    const mergedColors = { ...defaultColors, ...colors };
    const prefixClass = (className: string) => (prefix ? `${prefix}-${className}` : className);

    return `
/* Changerawr Markdown Styles */
@layer utilities {
  /* Typography */
  .${prefixClass('changerawr-text-3xl')} { font-size: 1.875rem; line-height: 2.25rem; }
  .${prefixClass('changerawr-text-2xl')} { font-size: 1.5rem; line-height: 2rem; }
  .${prefixClass('changerawr-text-xl')} { font-size: 1.25rem; line-height: 1.75rem; }
  .${prefixClass('changerawr-text-lg')} { font-size: 1.125rem; line-height: 1.75rem; }
  .${prefixClass('changerawr-font-bold')} { font-weight: 700; }
  .${prefixClass('changerawr-font-semibold')} { font-weight: 600; }
  .${prefixClass('changerawr-font-medium')} { font-weight: 500; }
  .${prefixClass('changerawr-italic')} { font-style: italic; }
  .${prefixClass('changerawr-underline')} { text-decoration: underline; }
  
  /* Spacing */
  .${prefixClass('changerawr-mt-8')} { margin-top: 2rem; }
  .${prefixClass('changerawr-mt-6')} { margin-top: 1.5rem; }
  .${prefixClass('changerawr-mb-4')} { margin-bottom: 1rem; }
  .${prefixClass('changerawr-leading-7')} { line-height: 1.75rem; }
  
  /* Layout */
  .${prefixClass('changerawr-flex')} { display: flex; }
  .${prefixClass('changerawr-items-center')} { align-items: center; }
  .${prefixClass('changerawr-gap-2')} { gap: 0.5rem; }
  
  /* Colors */
  .${prefixClass('changerawr-text-primary')} { color: ${mergedColors.primary}; }
  .${prefixClass('changerawr-text-muted-foreground')} { color: ${mergedColors.muted}; }
}

${includeExtensions ? `
@layer components {
  /* Alert Components */
  .${prefixClass('changerawr-alert')} {
    border-left-width: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.375rem;
    transition: color, background-color, border-color 200ms;
  }
  
  .${prefixClass('changerawr-alert-info')} {
    background-color: color-mix(in srgb, ${mergedColors.info} 10%, transparent);
    border-color: color-mix(in srgb, ${mergedColors.info} 30%, transparent);
    color: ${mergedColors.info};
  }
  
  .${prefixClass('changerawr-alert-warning')} {
    background-color: color-mix(in srgb, ${mergedColors.warning} 10%, transparent);
    border-color: color-mix(in srgb, ${mergedColors.warning} 30%, transparent);
    color: ${mergedColors.warning};
  }
  
  .${prefixClass('changerawr-alert-error')} {
    background-color: color-mix(in srgb, ${mergedColors.error} 10%, transparent);
    border-color: color-mix(in srgb, ${mergedColors.error} 30%, transparent);
    color: ${mergedColors.error};
  }
  
  .${prefixClass('changerawr-alert-success')} {
    background-color: color-mix(in srgb, ${mergedColors.success} 10%, transparent);
    border-color: color-mix(in srgb, ${mergedColors.success} 30%, transparent);
    color: ${mergedColors.success};
  }

  /* Button Components */
  .${prefixClass('changerawr-button')} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 150ms;
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
  }
  
  .${prefixClass('changerawr-button-primary')} {
    background-color: ${mergedColors.primary};
    color: white;
  }
  
  .${prefixClass('changerawr-button-primary')}:hover:not(:disabled) {
    background-color: color-mix(in srgb, ${mergedColors.primary} 90%, black);
  }
  
  .${prefixClass('changerawr-button-md')} {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
` : ''}
`;
};

export default changerawrMarkdownPlugin;