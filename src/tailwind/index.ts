/**
 * Tailwind CSS plugin exports for @changerawr/markdown
 */

// Export the main plugin, safelist helper, and types
export {
    changerawrMarkdownPlugin,
    getSafelist,
    type ChangerawrMarkdownPluginOptions
} from './plugin';

// Default export for convenience
export { changerawrMarkdownPlugin as default } from './plugin';