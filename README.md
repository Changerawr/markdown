# @changerawr/markdown

> Powerful TypeScript-first markdown renderer with custom extensions - supports HTML, Tailwind CSS, and JSON outputs

[![npm version](https://badge.fury.io/js/@changerawr%2Fmarkdown.svg)](https://www.npmjs.com/package/@changerawr/markdown)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-green.svg)](#testing)

## ✨ Features

- 🚀 **Multiple Output Formats**: HTML, Tailwind CSS, or JSON AST
- 🧩 **Custom Extensions**: Built-in Alert, Button, and Embed extensions
- ⚛️ **React Integration**: Drop-in `<MarkdownRenderer>` component + hooks
- 🍦 **Vanilla JS Support**: Use anywhere with `renderCum()` function
- 📝 **TypeScript First**: Fully typed with excellent IntelliSense
- 🎯 **Performance Focused**: Efficient parsing and rendering
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
```

### Media Embeds
Embed videos, images, and other media:

```markdown
[embed:youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ){autoplay:1}
[embed:image](https://example.com/image.jpg){width:800,height:600}
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

Create powerful custom extensions to extend markdown syntax:

```typescript
import { ChangerawrMarkdown } from '@changerawr/markdown';

const engine = new ChangerawrMarkdown();

// Add a highlight extension
engine.registerExtension({
  name: 'highlight',
  parseRules: [{
    name: 'highlight',
    pattern: /==(.+?)==/g,
    render: (match) => ({
      type: 'highlight',
      content: match[1],
      raw: match[0]
    })
  }],
  renderRules: [{
    type: 'highlight',
    render: (token) => `<mark class="bg-yellow-200 px-1">${token.content}</mark>`
  }]
});

const html = engine.toHtml('This is ==highlighted text==');
// <mark class="bg-yellow-200 px-1">highlighted text</mark>
```

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
  createMinimalEngine
} from '@changerawr/markdown';

// General purpose engine
const engine = createEngine();

// HTML-only engine
const htmlEngine = createHTMLEngine();

// Debug-enabled engine
const debugEngine = createDebugEngine();

// Minimal engine (no built-in extensions)
const minimalEngine = createMinimalEngine();
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

## 📊 Performance

### Metrics and Monitoring

```typescript
const engine = createDebugEngine();
const html = engine.toHtml('# Large Document...');

const metrics = engine.getPerformanceMetrics();
console.log('Parse time:', metrics.parseTime);
console.log('Render time:', metrics.renderTime);
console.log('Total time:', metrics.totalTime);
console.log('Token count:', metrics.tokenCount);
```

### Optimization Tips

- Use `createMinimalEngine()` if you don't need built-in extensions
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

### React Components

- `<MarkdownRenderer />` - Main React component
- `<SimpleMarkdownRenderer />` - Tailwind-styled renderer
- `<HTMLMarkdownRenderer />` - Plain HTML renderer
- `<SafeMarkdownRenderer />` - With error boundary

### React Hooks

- `useMarkdown(content: string, options?)` - Main markdown processing hook
- `useMarkdownEngine(options?)` - Engine management hook
- `useMarkdownDebug(content: string)` - Debug information hook

### Classes

- `ChangerawrMarkdown` - Main engine class
- `MarkdownParser` - Content parsing
- `MarkdownRenderer` - Token rendering

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

- **TypeScript-First**: Built with TypeScript from the ground up for excellent developer experience
- **Framework Agnostic**: Works with React, Vue, Svelte, vanilla JS, or any framework
- **Extensible Architecture**: Easy to add custom markdown syntax and rendering
- **Production Ready**: Thoroughly tested, performant, and secure
- **Modern Output**: Tailwind CSS support for modern web applications
- **Developer Friendly**: Great debugging tools and clear error messages

---

**[Get Started](https://github.com/changerawr/markdown#installation) • [Documentation](https://github.com/changerawr/markdown) • [Examples](https://github.com/changerawr/markdown/tree/main/examples) • [Contributing](https://github.com/changerawr/markdown/blob/main/CONTRIBUTING.md)**