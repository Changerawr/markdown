# @changerawr/markdown

> Powerful TypeScript-first markdown renderer with modular extensions - supports HTML, Tailwind CSS, and JSON outputs

[![npm version](https://badge.fury.io/js/@changerawr%2Fmarkdown.svg)](https://www.npmjs.com/package/@changerawr/markdown)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-green.svg)](#testing)

## ✨ Features

- 🚀 **Multiple Output Formats**: HTML, Tailwind CSS, or JSON AST
- 🧩 **Modular Extensions**: Every feature is an extension - mix and match what you need
- 📦 **Core Extensions**: Text, headings, bold, italic, code, links, images, lists, blockquotes, and more
- 🎨 **Feature Extensions**: Built-in Alert, Button, and Embed extensions
- ⚛️ **React Integration**: Drop-in `<MarkdownRenderer>` component + hooks
- 🍦 **Vanilla JS Support**: Use anywhere with `renderCum()` function
- 📝 **TypeScript First**: Fully typed with excellent IntelliSense
- ⚡ **High Performance**: Automatic caching, streaming support, handles 100K+ words efficiently
- 💾 **Smart Caching**: Built-in LRU cache for 100-1000x speedup on repeated renders
- 🛡️ **Secure**: Built-in HTML sanitization with DOMPurify
- 🔧 **Extensible**: Easy-to-write custom extensions
- 🎨 **Themeable**: Customizable CSS classes and styling

## 📦 Installation

```bash
npm install @changerawr/markdown
```

For React usage:
```bash
npm install @changerawr/markdown react react-dom
```

## 🚀 Quick Start

### Basic Usage (Vanilla JS)

```typescript
import { renderMarkdown } from '@changerawr/markdown';

const html = renderMarkdown('# Hello **World**!');
console.log(html);
// Output: <h1 class="text-3xl font-bold mt-8 mb-4">Hello <strong class="font-bold">World</strong>!</h1>
```

### React Component

```tsx
import { MarkdownRenderer } from '@changerawr/markdown/react';

function App() {
  const markdown = `
# Welcome to Changerawr Markdown

This is **bold text** and this is *italic text*.

- List item 1
- List item 2

:::info
This is an info alert with our custom extension!
:::
`;

  return (
    <MarkdownRenderer 
      content={markdown}
      className="prose max-w-none"
    />
  );
}
```

### React Hooks

```tsx
import { useMarkdown, useMarkdownEngine } from '@changerawr/markdown/react';

function MarkdownEditor() {
  const [content, setContent] = useState('# Hello World');
  const { html, tokens, isLoading, error } = useMarkdown(content);

  return (
    <div className="grid grid-cols-2 gap-4">
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-4"
      />
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        className="border p-4 prose"
      />
    </div>
  );
}
```

## 🧩 Modular Architecture

Unlike traditional markdown parsers, **every feature is an extension**. This gives you complete control over what functionality you include.

### Core Extensions (Always Available)
- **TextExtension**: Plain text rendering with HTML escaping
- **HeadingExtension**: H1-H6 headings with anchor links
- **BoldExtension** & **ItalicExtension**: Text formatting
- **InlineCodeExtension** & **CodeBlockExtension**: Code syntax
- **LinkExtension** & **ImageExtension**: Links and images
- **ListExtension** & **TaskListExtension**: Regular and task lists
- **BlockquoteExtension**: Quote blocks
- **HorizontalRuleExtension**: Horizontal dividers
- **ParagraphExtension** & **LineBreakExtension**: Text flow

### Feature Extensions (Built-in)
- **AlertExtension**: Colored alert boxes
- **ButtonExtension**: Interactive styled buttons
- **EmbedExtension**: Media embeds (YouTube, GitHub, etc.)

### Engine Variants

```typescript
import { 
  createEngine,           // Full-featured (default)
  createCoreOnlyEngine,   // Just markdown basics
  createMinimalEngine,    // Only specified extensions
  createHTMLEngine,       // Plain HTML output
  createTailwindEngine    // Tailwind CSS output
} from '@changerawr/markdown';

// Full-featured engine (all extensions)
const full = createEngine();

// Core markdown only (no alerts/buttons/embeds)
const core = createCoreOnlyEngine();

// Minimal engine with only specific extensions
const minimal = createMinimalEngine([
  TextExtension,
  HeadingExtension,
  BoldExtension
]);

// Custom combination
const custom = createCustomEngine([
  ...CoreExtensions,      // All core extensions
  MyCustomExtension       // Your extension
]);
```

## 🎨 Output Formats

### Tailwind CSS (Default)
Perfect for modern web applications using Tailwind CSS:

```typescript
import { renderToTailwind } from '@changerawr/markdown';

const html = renderToTailwind('# Heading');
// <h1 class="text-3xl font-bold mt-8 mb-4">Heading</h1>
```

### Plain HTML
Clean HTML without any CSS framework dependencies:

```typescript
import { renderToHTML } from '@changerawr/markdown';

const html = renderToHTML('# Heading');
// <h1>Heading</h1>
```

### JSON AST
For advanced processing and custom rendering:

```typescript
import { renderToJSON } from '@changerawr/markdown';

const ast = renderToJSON('# Heading');
// { type: 'heading', content: 'Heading', level: 1, ... }
```

## 🧩 Built-in Extensions

### Alert Boxes
Create beautiful alert boxes with different styles:

```markdown
:::info Important Info
This is an informational alert with custom styling.
:::

:::warning Be Careful
This is a warning alert.
:::

:::error Something went wrong
This is an error alert.
:::

:::success Task Complete
This is a success alert.
:::
```

### Interactive Buttons
Add styled buttons with custom actions:

```markdown
[button:Get Started](https://example.com){primary,lg}
[button:Learn More](https://docs.example.com){secondary,sm}
[button:Same Tab](https://example.com){success,self}
[button:Disabled](#){danger,disabled}
```

### Media Embeds
Embed videos, images, and other media:

```markdown
[embed:youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ){autoplay:1}
[embed:github](https://github.com/user/repo)
[embed:codepen](https://codepen.io/user/pen/abc123){height:500,theme:dark}
```

## ⚛️ React Components

### MarkdownRenderer
The main component for rendering markdown:

```tsx
<MarkdownRenderer 
  content="# Hello World"
  format="tailwind"
  className="prose"
  onRender={(html, tokens) => console.log('Rendered!', { html, tokens })}
  onError={(error) => console.error('Error:', error)}
/>
```

### Specialized Components

```tsx
// Simple Tailwind renderer
<SimpleMarkdownRenderer content="# Simple" />

// HTML-only renderer (no CSS classes)
<HTMLMarkdownRenderer content="# Plain HTML" />

// With error boundary
<SafeMarkdownRenderer 
  content="# Safe"
  errorFallback={(error) => <div>Oops: {error.message}</div>}
/>
```

## 🔧 Custom Extensions

Extensions are the building block of the entire library — every feature, including all the built-ins, is an extension. You can add new syntax, replace existing behaviour, or attach full React components for framework-specific rendering while keeping a plain-HTML fallback for everywhere else.

```typescript
import { createEngine } from '@changerawr/markdown';

const HighlightExtension = {
  name: 'highlight',
  parseRules: [{
    name: 'highlight',
    pattern: /==(.+?)==/,
    render: (match) => ({
      type: 'highlight',
      content: match[1] ?? '',
      raw: match[0] ?? '',
    })
  }],
  renderRules: [{
    type: 'highlight',
    render: (token) => `<mark class="bg-yellow-200 px-1">${token.content}</mark>`
  }]
};

const engine = createEngine();
engine.registerExtension(HighlightExtension);

engine.toHtml('This is ==highlighted text==');
// Works in React, Astro, vanilla JS, Node — everywhere.
```

**[Full extension documentation →](./EXTENSIONS.md)**

The guide covers: block extensions, inline extensions, passing attributes, **recursive content parsing**, component extensions with React state and lifecycle, Astro compatibility, priority ordering, TypeScript types, and complete worked examples.

### Recursive Content Parsing (New in v1.3.0)

Extensions can now opt-in to recursive markdown parsing inside their blocks using `recursiveContent: true`:

```typescript
const CalloutExtension = {
  name: 'callout',
  parseRules: [{
    name: 'callout',
    pattern: /::callout\n([\s\S]*?)\n::callout/,
    recursiveContent: true,  // Nested markdown will be parsed and rendered
    render: (match) => ({
      type: 'callout',
      content: match[1]?.trim() ?? '',
      raw: match[0] ?? '',
    })
  }],
  renderRules: [{
    type: 'callout',
    render: (token) => {
      // Use pre-rendered children
      const content = token.attributes?.renderedChildren || token.content;
      return `<div class="callout">${content}</div>`;
    }
  }]
};
```

This allows **bold**, *italic*, lists, and other markdown to render correctly inside custom block extensions. See [EXTENSIONS.md](./EXTENSIONS.md#recursive-content-parsing) for full details.

## 🎯 Advanced Configuration

### Engine Configuration

```typescript
import { ChangerawrMarkdown } from '@changerawr/markdown';

const engine = new ChangerawrMarkdown({
  parser: {
    debugMode: true,
    validateMarkdown: true,
    maxIterations: 10000
  },
  renderer: {
    format: 'tailwind',
    sanitize: true,
    allowUnsafeHtml: false,
    customClasses: {
      'heading-1': 'text-4xl font-black mb-6',
      'paragraph': 'text-lg leading-relaxed mb-4'
    }
  }
});
```

### React Hook Options

```tsx
const { html, tokens, isLoading, error } = useMarkdown(content, {
  format: 'tailwind',
  debug: true,
  extensions: [myCustomExtension],
  config: {
    renderer: {
      sanitize: true,
      customClasses: { /* ... */ }
    }
  }
});
```

## 🏭 Factory Functions

Convenient factory functions for common use cases:

```typescript
import { 
  createEngine,
  createHTMLEngine,
  createTailwindEngine,
  createDebugEngine,
  createMinimalEngine,
  createCoreOnlyEngine
} from '@changerawr/markdown';

// General purpose engine (all extensions)
const engine = createEngine();

// HTML-only engine
const htmlEngine = createHTMLEngine();

// Debug-enabled engine
const debugEngine = createDebugEngine();

// Core markdown only (no feature extensions)
const coreEngine = createCoreOnlyEngine();

// Minimal engine (no built-in extensions)
const minimalEngine = createMinimalEngine([TextExtension, HeadingExtension]);
```

## 🍦 Standalone Usage (No React)

Perfect for Node.js, vanilla JavaScript, or any non-React environment:

```html
<script src="https://unpkg.com/@changerawr/markdown/dist/standalone.browser.js"></script>
<script>
  const html = ChangerawrMarkdown.renderCum('# Hello World!');
  document.body.innerHTML = html;
</script>
```

```javascript
// Node.js
const { renderCum, parseCum } = require('@changerawr/markdown/standalone');

const html = renderCum('# Hello World');
const tokens = parseCum('# Hello World');
```

## 🎨 Styling & Theming

### Tailwind CSS Plugin (v3 & v4 Compatible)

**For Tailwind CSS v3:**
```javascript
// tailwind.config.js
const { changerawrMarkdownPlugin } = require('@changerawr/markdown/tailwind');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    changerawrMarkdownPlugin({
      includeExtensions: true,   // Include alert/button styles
      darkMode: true            // Include dark mode variants
    })
  ]
}
```

**For Tailwind CSS v4:**
```javascript
// tailwind.config.js
import { changerawrMarkdownPlugin } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    changerawrMarkdownPlugin({
      includeExtensions: true,   // Include alert/button styles
      darkMode: true            // Include dark mode variants
    })
  ]
}
```

The plugin ensures all necessary classes are available for markdown rendering, even if they're not used elsewhere in your app.

### Custom CSS Classes

```typescript
const engine = new ChangerawrMarkdown({
  renderer: {
    format: 'tailwind',
    customClasses: {
      'heading-1': 'text-5xl font-black text-purple-900 mb-8',
      'heading-2': 'text-3xl font-bold text-purple-800 mb-6',
      'paragraph': 'text-gray-700 leading-loose mb-6',
      'blockquote': 'border-l-4 border-purple-500 pl-6 italic text-gray-600',
      'code-inline': 'bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono text-sm',
      'code-block': 'bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto font-mono',
      'link': 'text-purple-600 hover:text-purple-800 underline',
      'list-item': 'mb-2 text-gray-700'
    }
  }
});
```

### Preset Configurations

```typescript
import { createEngineWithPreset } from '@changerawr/markdown';

// Blog/article styling
const blogEngine = createEngineWithPreset('blog');

// Documentation styling  
const docsEngine = createEngineWithPreset('docs');

// Minimal styling
const minimalEngine = createEngineWithPreset('minimal');

// Core-only (no feature extensions)
const coreEngine = createEngineWithPreset('coreOnly');
```

## 🔍 Debugging & Development

### Debug Mode

```tsx
<MarkdownRenderer 
  content="# Debug Me"
  debug={true}
  onRender={(html, tokens) => {
    console.log('HTML:', html);
    console.log('Tokens:', tokens);
  }}
/>
```

### Debug Hook

```tsx
import { useMarkdownDebug } from '@changerawr/markdown/react';

function DebugComponent() {
  const { html, tokens, debug, stats } = useMarkdownDebug('# Hello World');
  
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </div>
  );
}
```

## 📊 Performance & Caching

Built-in performance optimizations handle large documents efficiently with automatic caching and streaming support.

### Automatic Caching

The engine automatically caches parsed and rendered content for instant repeated renders:

```typescript
const engine = new ChangerawrMarkdown();

// First render - parses and renders
const html1 = engine.toHtml(largeMarkdown); // ~100ms

// Second render - served from cache
const html2 = engine.toHtml(largeMarkdown); // <1ms (100x+ faster!)

// Check cache statistics
const stats = engine.getCacheStats();
console.log(stats.parse.hits, stats.parse.hitRate);
console.log(stats.render.hits, stats.render.hitRate);

// Clear caches if needed
engine.clearCaches();

// Adjust cache size (default: 100 entries)
engine.setCacheSize(200);
```

### Streaming for Large Documents

Stream large documents in chunks for progressive rendering:

```typescript
const engine = new ChangerawrMarkdown();

const html = await engine.toHtmlStreamed(hugeMarkdown, {
  chunkSize: 50,  // Render 50 tokens at a time
  onChunk: ({ html, progress }) => {
    console.log(`Rendered: ${(progress * 100).toFixed(0)}%`);
    // Update UI progressively
    updatePreview(html);
  }
});
```

### Performance Metrics

Track rendering performance with built-in metrics:

```typescript
const { html, metrics } = engine.toHtmlWithMetrics(markdown);

console.log('Input size:', metrics.inputSize);
console.log('Parse time:', metrics.parseTime, 'ms');
console.log('Render time:', metrics.renderTime, 'ms');
console.log('Total time:', metrics.totalTime, 'ms');
console.log('Token count:', metrics.tokenCount);
console.log('Cache hit:', metrics.cacheHit);
```

### Memoization Helper

Memoize expensive operations with the built-in helper:

```typescript
import { memoize } from '@changerawr/markdown';

const expensiveTransform = memoize((content: string) => {
  // Complex transformation here
  return processContent(content);
});

// First call - computed
const result1 = expensiveTransform(data); // Slow

// Second call with same input - cached
const result2 = expensiveTransform(data); // Instant!
```

### Performance Benchmarks

- **Small documents** (1K words): ~15ms
- **Medium documents** (10K words): ~400ms
- **Large documents** (100K words): ~32s first render, <1ms cached
- **Cache speedup**: 100-1000x faster for repeated content

### Optimization Tips

- **Caching is automatic** - no configuration needed for most use cases
- Use `toHtmlStreamed()` for documents over 10,000 words
- Use `createCoreOnlyEngine()` if you don't need feature extensions
- Use `createMinimalEngine()` with only the extensions you need
- Set `sanitize: false` if you trust your content (be careful!)
- Use `format: 'html'` for lighter output without CSS classes
- Implement custom extensions efficiently to avoid performance bottlenecks

## 🧪 Testing

All components and functions are thoroughly tested:

```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run with coverage report
```

## 📚 API Reference

### Core Functions

- `renderMarkdown(content: string): string` - Render with default Tailwind output
- `parseMarkdown(content: string): MarkdownToken[]` - Parse to token array
- `renderToHTML(markdown: string): string` - Render to plain HTML
- `renderToTailwind(markdown: string): string` - Render with Tailwind classes
- `renderToJSON(markdown: string): JsonAstNode` - Render to JSON AST

### Performance & Cache Functions

- `engine.toHtml(markdown: string): string` - Render with automatic caching
- `engine.toHtmlWithMetrics(markdown: string): { html, metrics }` - Render with performance metrics
- `engine.toHtmlStreamed(markdown: string, options?): Promise<string>` - Stream large documents
- `engine.getCacheStats(): { parse, render }` - Get cache statistics
- `engine.clearCaches(): void` - Clear all caches
- `engine.setCacheSize(size: number): void` - Update cache capacity
- `memoize<T>(fn: T): T` - Memoize any function

### Factory Functions

- `createEngine(config?)` - Full-featured engine
- `createCoreOnlyEngine(config?)` - Core markdown only
- `createMinimalEngine(extensions[])` - Minimal with specified extensions
- `createHTMLEngine(config?)` - HTML output optimized
- `createTailwindEngine(config?)` - Tailwind output optimized
- `createDebugEngine(config?)` - Debug mode enabled
- `createCustomEngine(extensions[], config?)` - Custom extension set

### React Components

- `<MarkdownRenderer />` - Main React component
- `<SimpleMarkdownRenderer />` - Tailwind-styled renderer
- `<HTMLMarkdownRenderer />` - Plain HTML renderer
- `<SafeMarkdownRenderer />` - With error boundary

### React Hooks

- `useMarkdown(content: string, options?)` - Main markdown processing hook
- `useMarkdownComponents(content: string, options?)` - Hook for component extensions (returns `componentMap` + `renderBatch`)
- `useMarkdownEngine(options?)` - Engine management hook
- `useMarkdownDebug(content: string)` - Debug information hook

### Classes

- `ChangerawrMarkdown` - Main engine class
- `MarkdownParser` - Content parsing
- `MarkdownRenderer` - Token rendering

### Extensions

- **Core Extensions**: `CoreExtensions` array or individual exports
- **Feature Extensions**: `AlertExtension`, `ButtonExtension`, `EmbedExtension`
- **Custom**: Create your own with `parseRules` and `renderRules` — [see the extension guide](./EXTENSIONS.md)
- **Component Extensions**: Attach React components to render rules via `ReactComponentExtension` (with universal string fallback for Astro, HTML, etc.)

### Astro

- `renderMarkdownForAstro(content, options?)` — server-side render to HTML string
- `<MarkdownRenderer />` — zero-JS Astro component (`@changerawr/markdown/astro/MarkdownRenderer.astro`)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Changerawr Team](https://github.com/changerawr)

---

## 💡 What Makes It Special?

- **Extension-First Architecture**: Every feature is modular - use only what you need
- **TypeScript-First**: Built with TypeScript from the ground up for excellent developer experience
- **Framework Agnostic**: Works with React, Vue, Svelte, vanilla JS, or any framework
- **Production Ready**: Thoroughly tested, performant, and secure
- **Modern Output**: Tailwind CSS support for modern web applications
- **Developer Friendly**: Great debugging tools and clear error messages

---

**[Get Started](https://github.com/changerawr/markdown#installation) • [Documentation](https://github.com/changerawr/markdown) • [Examples](https://github.com/changerawr/markdown/tree/main/examples) • [Contributing](https://github.com/changerawr/markdown/blob/main/CONTRIBUTING.md)**