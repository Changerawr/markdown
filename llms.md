# @changerawr/markdown - LLM Library Guide

This document provides comprehensive information about the @changerawr/markdown library for LLMs and AI assistants to understand and use the codebase effectively.

## Quick Summary

**@changerawr/markdown** is a TypeScript-first markdown parser and renderer with an extension-based architecture. It converts markdown text into HTML, Tailwind CSS-styled output, or JSON AST format. The library supports:

- Core markdown (headings, bold, italic, code, lists, blockquotes, etc.)
- Feature extensions (alerts, buttons, media embeds)
- Custom extensions (easily add your own markdown syntax)
- Multiple output formats (HTML, Tailwind CSS, JSON)
- React integration with hooks and components
- Vanilla JavaScript support

## Architecture Overview

### Core Components

1. **MarkdownParser** (`src/parser.ts`)
   - Converts markdown text into tokens
   - Uses regex-based rules for pattern matching
   - Supports recursive parsing for nested content
   - Position-aware matching (finds earliest match at current position)
   - Returns array of `MarkdownToken` objects

2. **MarkdownRenderer** (`src/renderer.ts`)
   - Converts tokens to output format (HTML, Tailwind, etc.)
   - Uses rules mapped by token type
   - Supports recursive rendering of children tokens
   - Handles format injection (HTML vs Tailwind CSS)

3. **ChangerawrMarkdown Engine** (`src/engine.ts`)
   - Main orchestrator class
   - Manages parser, renderer, and extensions
   - Validates and registers extensions
   - Provides convenient API (parse, render, toHtml)
   - Supports extension lifecycle (registration/unregistration)

### Extension System

Every feature is implemented as an extension. Extensions define:

**Parse Rules**: How to recognize markdown syntax
- `name`: Unique identifier
- `pattern`: RegExp to match syntax
- `render`: Function to create token from match

**Render Rules**: How to output tokens
- `type`: Token type to match
- `render`: Function to convert token to HTML/etc.

### Token Structure

```typescript
interface MarkdownToken {
  type: string;                                    // Token type (e.g., 'bold', 'heading', 'alert')
  content: string;                                 // Raw content
  raw: string;                                     // Original matched text
  attributes?: Record<string, string | any>;      // Metadata (format, level, checked, etc.)
  children?: MarkdownToken[];                      // Recursive children from nested parsing
}
```

## Core Extensions

Located in `src/extensions/core/`:

### Text & Structure
- **TextExtension**: Plain text with HTML escaping
- **HeadingExtension**: H1-H6 headings with slug generation for anchor IDs
- **ParagraphExtension**: Paragraph blocks
- **LineBreakExtension**: Hard breaks and soft breaks

### Formatting
- **BoldExtension**: `**text**` → bold
- **ItalicExtension**: `*text*` → italic
- **InlineCodeExtension**: `` `code` `` → inline code
- **CodeBlockExtension**: ` ```language ... ``` ` → code blocks

### Content
- **LinkExtension**: `[text](url)` → links
- **ImageExtension**: `![alt](src)` → images
- **ListExtension**: `- item` → lists with inline formatting support
- **TaskListExtension**: `- [x] task` → checkable task lists
- **BlockquoteExtension**: `> quote` → blockquotes
- **HorizontalRuleExtension**: `---` → horizontal rules

**Key Feature**: Lists now support inline markdown (bold, italic, code, links)

## Feature Extensions

Located in `src/extensions/`:

### AlertExtension (`alert.ts`)
Creates colored alert boxes with icons.
- **Types**: info, warning, error, success, tip, note
- **Syntax**:
  ```
  :::info
  Content here
  :::

  :::warning My Title
  Content with title
  :::
  ```
- **Pattern Fix**: `/:::(\w+)(?: ([^\n]+))?\n([\s\S]*?)\n:::/`
  - Non-capturing group for space: `(?: ...)`
  - Title restricted to single line: `[^\n]+`
  - Prevents title greedy matching across blank lines

### ButtonExtension (`button.ts`)
Creates styled interactive buttons.
- **Syntax**: `[button:Label](url){style,size}`
- **Styles**: primary, secondary, success, danger, warning
- **Sizes**: xs, sm, md, lg, xl

### EmbedExtension (`embed.ts`)
Embeds media (YouTube, GitHub, CodePen, etc.)
- **Syntax**: `[embed:platform](url){options}`
- **Platforms**: youtube, github, codepen, and more

## Parsing Pipeline

1. **Preprocessing**: Normalize line endings
2. **Rule Ordering**: Sort rules by priority
   - Feature extensions first (more specific)
   - Core extensions next
   - Images before links
   - Task lists before regular lists
   - Code blocks before inline code
   - Bold before italic
3. **Position-Based Matching**: Find earliest match in remaining text
4. **Token Generation**: Create token from matched rule
5. **Recursive Parsing**: Parse children for nested content
   - Blocks: alert, blockquote, list-item, task-item
6. **Post-Processing**: Merge consecutive text tokens
7. **Output**: Return token array

## Rendering Pipeline

1. **Format Injection**: Add format type to all tokens
2. **Recursive Rendering**: Render children first if present
3. **Token-to-HTML**: Apply render rule for each token type
4. **Sanitization**: Optional HTML sanitization with DOMPurify
5. **Output**: Return HTML string

## Key Files

### Type Definitions
- `src/types.ts` - All TypeScript interfaces and types

### Core Classes
- `src/parser.ts` - MarkdownParser class
- `src/renderer.ts` - MarkdownRenderer class
- `src/engine.ts` - ChangerawrMarkdown engine
- `src/utils.ts` - Helper functions

### Extensions
- `src/extensions/core/` - Core markdown extensions
- `src/extensions/core/index.ts` - Exports all core extensions
- `src/extensions/alert.ts` - Alert box extension
- `src/extensions/button.ts` - Button extension
- `src/extensions/embed.ts` - Media embed extension
- `src/extensions/index.ts` - Exports all extensions

### React Integration
- `src/react/` - React components and hooks
  - `MarkdownRenderer` component
  - `useMarkdown` hook
  - `useMarkdownEngine` hook

### Utilities
- `src/standalone.ts` - Vanilla JS API
- `src/tailwind/` - Tailwind CSS plugin
- `src/utils.ts` - HTML escaping, sanitization helpers

## Testing

All code is tested with **Vitest**:
- `tests/core-extensions.test.ts` - Core extension tests
- `tests/feature-extensions.test.ts` - Feature extension tests
- `tests/engine-integration.test.ts` - Integration tests
- `tests/alert-bug-reproduction.test.ts` - Alert rendering tests
- `tests/react.test.tsx` - React component tests

Test location: 137 tests across 7 test files, all passing.

## Common Patterns & Idioms

### Creating a Custom Extension

```typescript
const myExtension = {
  name: 'my-feature',
  parseRules: [{
    name: 'my-feature',
    pattern: /~~(.+?)~~/,
    render: (match) => ({
      type: 'strikethrough',
      content: match[1],
      raw: match[0]
    })
  }],
  renderRules: [{
    type: 'strikethrough',
    render: (token) => `<del>${token.content}</del>`
  }]
};

engine.registerExtension(myExtension);
```

### Inline Formatting in Lists

Lists now recursively parse inline content, enabling:
```markdown
- **Technical**: This is bold followed by regular text
- *Italicized* content with **nested bold**
- Code: `console.log()` in lists
```

### Accessing Rendered Children

Extensions can access pre-rendered children instead of raw content:
```typescript
render: (token) => {
  const content = token.attributes?.renderedChildren || escapeHtml(token.content);
  return `<div>${content}</div>`;
}
```

## Recent Updates & Fixes

### List Formatting (Latest)
- Added recursive parsing for list items (`list-item`, `task-item`)
- Lists now support inline markdown: bold, italic, code, links
- Updated parser to include lists in recursive block parsing

### Alert Rendering (Latest)
- Fixed regex pattern for alerts without titles
- Pattern: `/:::(\w+)(?: ([^\n]+))?\n([\s\S]*?)\n:::/`
- Correctly handles multiple consecutive alerts
- Supports optional titles on same line as alert type

### Type System (Latest)
- Updated `MarkdownToken.attributes` to allow functions
- Changed from `Record<string, string>` to `Record<string, string | number | boolean | Function | any>`
- Enables callback-based markdown rendering and complex attributes

## Performance Considerations

1. **Parser**: O(n) iteration through markdown text
2. **Rule Ordering**: Sorted for priority matching
3. **Position-Based**: Avoids backtracking
4. **Recursive Parsing**: Only for block elements (alert, blockquote, list-item, task-item)
5. **Token Merging**: Consolidates consecutive text tokens

## Security

- **HTML Escaping**: Default for all user content
- **HTML Sanitization**: Optional with DOMPurify
- **Unsafe HTML**: Can be disabled for trusted content only

## Usage Examples

### Basic Usage
```typescript
import { renderMarkdown } from '@changerawr/markdown';
const html = renderMarkdown('# Hello **World**');
```

### Custom Engine
```typescript
const engine = new ChangerawrMarkdown({
  renderer: { format: 'tailwind' }
});
const html = engine.toHtml('# Heading');
```

### React Component
```typescript
import { MarkdownRenderer } from '@changerawr/markdown/react';
<MarkdownRenderer content="# Hello" format="tailwind" />
```

### Custom Extension
```typescript
engine.registerExtension(customExtension);
```

## Build & Development

- **Build**: `npm run build` (TypeScript → JavaScript via tsup)
- **Dev**: `npm run dev` (watch mode)
- **Test**: `npm test` (Vitest)
- **Type Check**: `npm run type-check`
- **Lint**: `npm run lint`

## Dependencies

- **dompurify**: HTML sanitization
- **react** (peer): For React integration
- **tailwindcss** (peer): For Tailwind plugin

## Export Structure

- **Main**: `dist/index.js` - Full library with all extensions
- **React**: `dist/react/index.js` - React components
- **Tailwind**: `dist/tailwind/index.js` - Tailwind plugin
- **Standalone**: `dist/standalone.js` - Vanilla JS with no deps
- **CSS**: `dist/css/` - CSS assets

## When to Modify the Library

### Common Tasks

1. **Adding new markdown syntax**: Create extension in `src/extensions/`
2. **Fixing parsing bugs**: Modify `src/parser.ts` rules or extension patterns
3. **Changing output format**: Modify render rule in extension or renderer
4. **Supporting new token attributes**: Update `MarkdownToken` interface
5. **Adding React features**: Update `src/react/` components

### Testing After Changes

```bash
npm run build          # Compile
npm test              # Run tests
npm run type-check    # Check types
```

## Important Notes for LLMs

1. **Extension Priority**: Rules are sorted by type and name within type
2. **Position-Based Parsing**: Parser always finds earliest match in remaining text
3. **Recursive Parsing**: Children are parsed using same rules, so they can be nested
4. **HTML Safety**: Always escape user content unless explicitly disabled
5. **Type Safety**: Use TypeScript interfaces to ensure token consistency
6. **Testing**: Run tests after any changes to verify behavior

## Resources

- **Repository**: https://github.com/changerawr/markdown
- **NPM**: https://www.npmjs.com/package/@changerawr/markdown
- **README**: See README.md for user documentation
- **Tests**: See tests/ directory for usage examples