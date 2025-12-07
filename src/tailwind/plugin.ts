// plugin.ts
import plugin from 'tailwindcss/plugin';

export interface ChangerawrMarkdownPluginOptions {
    /** Whether to include extension classes for alerts and buttons (default: true) */
    includeExtensions?: boolean;
    /** Whether to include dark mode variants (default: true) */
    darkMode?: boolean;
}

/**
 * @deprecated This plugin cannot force Tailwind to generate classes.
 * Use the exported MARKDOWN_SAFELIST instead:
 *
 * ```typescript
 * import { MARKDOWN_SAFELIST } from '@changerawr/markdown/tailwind';
 *
 * export default {
 *   safelist: MARKDOWN_SAFELIST,
 *   // ...
 * }
 * ```
 */
export const changerawrMarkdownPlugin = plugin.withOptions<ChangerawrMarkdownPluginOptions>(
    () => () => {
        // This plugin intentionally does nothing.
        // Tailwind's plugin API cannot inject safelist configuration.
        // Users must import MARKDOWN_SAFELIST directly in their config.
    }
);

export default changerawrMarkdownPlugin;