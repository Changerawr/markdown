# @changerawr/markdown

> Powerful markdown renderer with custom extensions - supports HTML, Tailwind CSS, and JSON outputs

## Features

- 🚀 **Multiple Output Formats**: HTML, Tailwind CSS, or JSON AST
- 🧩 **Custom Extensions**: Built-in Alert, Button, and Embed extensions
- ⚛️ **React Integration**: Drop-in `<MarkdownRenderer>` component
- 🍦 **Vanilla JS Support**: Use `renderCum()` function anywhere
- 📝 **TypeScript First**: Fully typed with excellent IntelliSense
- 🎯 **Performance Focused**: Efficient parsing and rendering
- 🛡️ **Secure**: Built-in HTML sanitization with DOMPurify

## Quick Start

### Installation

```bash
npm install @changerawr/markdown
```

### Basic Usage

```typescript
import { renderMarkdown } from '@changerawr/markdown';

const html = renderMarkdown('# Hello **World**!');
console.log(html);
// <h1>Hello <strong>World</strong>!</h1>
```

### React Component

```tsx
import { MarkdownRenderer } from '@changerawr/markdown/react';

function App() {
  return (
    <MarkdownRenderer 
      content="# Hello **World**!"
      className="prose"
    />
  );
}
```

### Built-in Extensions

```markdown
<!-- Alert -->
:::info Important Info
This is an informational alert with custom styling.
:::

<!-- Button -->
[button:Click Me](https://example.com){primary,lg}

<!-- Embed -->
[embed:youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ){autoplay:1}
```

## Output Formats

### HTML Output
```typescript
import { renderToHTML } from '@changerawr/markdown/outputs/html';

const html = renderToHTML('**Bold text**');
// <strong>Bold text</strong>
```

### Tailwind CSS Output (Default)
```typescript
import { renderToTailwind } from '@changerawr/markdown/outputs/tailwind';

const html = renderToTailwind('**Bold text**');
// <strong class="font-bold">Bold text</strong>
```

### JSON AST Output
```typescript
import { renderToJSON } from '@changerawr/markdown/outputs/json';

const ast = renderToJSON('**Bold text**');
// { type: 'bold', content: 'Bold text', ... }
```

## Custom Extensions

```typescript
import { ChangerawrMarkdown } from '@changerawr/markdown';

const markdown = new ChangerawrMarkdown();

markdown.registerExtension({
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
    render: (token) => `<mark>${token.content}</mark>`
  }]
});

const html = markdown.toHtml('==highlighted text==');
// <mark>highlighted text</mark>
```

## Standalone Usage (No React)

```html
<script src="https://unpkg.com/@changerawr/markdown/dist/standalone.js"></script>
<script>
  const html = ChangerawrMarkdown.renderCum('# Hello World!');
  document.body.innerHTML = html;
</script>
```

## API Reference

### Core Functions

- `renderMarkdown(content: string): string` - Render with default Tailwind output
- `parseMarkdown(content: string): MarkdownToken[]` - Parse to token array
- `ChangerawrMarkdown` - Main engine class for advanced usage

### React Components

- `<MarkdownRenderer>` - Main React component
- `useMarkdown(content: string)` - React hook for markdown processing

### Extension System

- `registerExtension(extension: Extension)` - Add custom extensions
- Built-in extensions: `AlertExtension`, `ButtonExtension`, `EmbedExtension`

## License

MIT © Changerawr Team