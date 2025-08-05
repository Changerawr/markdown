# Tailwind Plugin Setup

The `@changerawr/markdown` Tailwind plugin ensures all necessary classes are available for markdown rendering.

## Quick Setup

### 1. Install the package
```bash
npm install @changerawr/markdown
```

### 2. Add to your `tailwind.config.js`
```javascript
import { changerawrMarkdownPlugin } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    changerawrMarkdownPlugin()
  ]
}
```

### 3. Use markdown components
```tsx
import { MarkdownRenderer } from '@changerawr/markdown/react';

function App() {
  return (
    <MarkdownRenderer content="# Hello World\n\nThis **works** perfectly!" />
  );
}
```

That's it! Your markdown will render with proper Tailwind styling even if those specific classes aren't used elsewhere in your app.

## Why You Need This

Without the plugin, Tailwind might purge classes like `text-3xl`, `font-bold`, etc. if they're not found in your templates. The plugin ensures these classes are always available for markdown rendering.

## Custom Options (Optional)

```javascript
changerawrMarkdownPlugin({
  prefix: 'md',              // Prefix classes with 'md-'
  includeExtensions: true,   // Include alert/button styles
  darkMode: true            // Include dark mode variants
})
```