# Tailwind Setup Guide

The `@changerawr/markdown` library provides clean Tailwind CSS integration for both v3 and v4. Choose the setup method that matches your Tailwind version.

## 🚀 Quick Setup

### Tailwind v4 (CSS Import Method - Recommended)

Tailwind v4 uses CSS imports instead of plugins for better performance and tree-shaking.

**1. Install the package**
```bash
npm install @changerawr/markdown
```

**2. Import styles in your main CSS file**
```css
@import "tailwindcss";
@import "@changerawr/markdown/css";
```

**3. Use markdown components**
```tsx
import { MarkdownRenderer } from '@changerawr/markdown/react';

function App() {
  return (
    <MarkdownRenderer content="# Hello **World**!" />
  );
}
```

### Tailwind v3 (Plugin Method)

For Tailwind v3, use the plugin to ensure classes aren't purged.

**1. Install the package**
```bash
npm install @changerawr/markdown
```

**2. Add plugin to your `tailwind.config.js`**
```javascript
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

**3. Use markdown components**
```tsx
import { MarkdownRenderer } from '@changerawr/markdown/react';

function App() {
  return (
    <MarkdownRenderer content="# Hello **World**!" />
  );
}
```

## 🎯 Why You Need This

Without proper setup, Tailwind might purge essential classes like `text-3xl`, `font-bold`, etc. if they're not found in your templates. Our setup ensures these classes are always available for markdown rendering.

## 📂 Project Structure

### Tailwind v4 Structure
```
src/
├── styles/
│   └── globals.css              # Your main CSS file
├── components/
│   └── MarkdownRenderer.tsx
└── ...

# globals.css
@import "tailwindcss";
@import "@changerawr/markdown/css";
```

### Tailwind v3 Structure
```
src/
├── components/
│   └── MarkdownRenderer.tsx
└── ...
tailwind.config.js               # Plugin configuration
```

## ⚙️ Configuration Options

### Tailwind v4 (CSS Variables)

Create custom themes using CSS variables:

```css
@import "tailwindcss";

@layer base {
  :root {
    --markdown-primary: theme(colors.blue.600);
    --markdown-warning: theme(colors.amber.500);
    --markdown-error: theme(colors.red.500);
    --markdown-success: theme(colors.green.500);
  }
  
  .dark {
    --markdown-primary: theme(colors.blue.400);
    --markdown-warning: theme(colors.amber.400);
    --markdown-error: theme(colors.red.400);
    --markdown-success: theme(colors.green.400);
  }
}

@import "@changerawr/markdown/css";
```

### Tailwind v3 (Plugin Options)

```javascript
import { changerawrMarkdownPlugin } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    changerawrMarkdownPlugin({
      includeExtensions: false,  // Disable alert/button styles
      darkMode: false           // Disable dark mode variants
    })
  ]
}
```

## 🎨 Standard Classes Used

Both setups ensure these standard Tailwind classes are available:

### Typography
```html
<h1 class="text-3xl font-bold mt-8 mb-4">Heading 1</h1>
<h2 class="text-2xl font-semibold mt-6 mb-3">Heading 2</h2>
<strong class="font-bold">Bold text</strong>
<em class="italic">Italic text</em>
```

### Layout & Spacing
```html
<div class="flex items-center gap-2">
<ul class="list-disc list-inside space-y-1">
  <li class="ml-4">List item</li>
</ul>
<blockquote class="border-l-4 pl-4 py-2">Quote</blockquote>
```

### Extensions (when enabled)
```html
<!-- Alert -->
<div class="border-l-4 p-4 mb-4 rounded-md bg-blue-500/10 border-blue-500/30 text-blue-600">
  Info alert
</div>

<!-- Button -->
<a class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Button
</a>
```

## 🌙 Dark Mode Support

Both setups include automatic dark mode support:

### Tailwind v4
```css
@layer utilities {
  .dark .text-blue-600 { color: theme(colors.blue.400); }
  .dark .bg-blue-500\/10 { background-color: color-mix(in srgb, theme(colors.blue.500) 20%, transparent); }
}
```

### Tailwind v3
Automatically included with `darkMode: true` option.

## 🔧 Advanced Customization

### Minimal Setup (Core Only)

**Tailwind v4:**
```css
@import "tailwindcss";
@import "@changerawr/markdown/css/core"; /* Only typography, no extensions */
```

**Tailwind v3:**
```javascript
changerawrMarkdownPlugin({
  includeExtensions: false  // Only core markdown styles
})
```

### Custom Color Scheme

**Tailwind v4:**
```css
@layer base {
  :root {
    --markdown-primary: #8b5cf6;  /* purple */
    --markdown-accent: #ec4899;   /* pink */
  }
}
```

**Tailwind v3:**
Configure through your Tailwind theme colors - the plugin uses standard color names.

## 🚨 Troubleshooting

### Tailwind v4 Issues

**Styles not appearing?**
```css
/* ✅ Correct order */
@import "tailwindcss";
@import "@changerawr/markdown/css";

/* ❌ Wrong order */
@import "@changerawr/markdown/css";
@import "tailwindcss"; /* This overrides our styles */
```

**Using a bundler?** Make sure CSS imports are properly resolved:
```javascript
// vite.config.js
export default {
  css: {
    postcss: './postcss.config.js',
  }
}
```

### Tailwind v3 Issues

**Classes still being purged?**
```javascript
// Make sure content paths include markdown components
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@changerawr/markdown/**/*.{js,ts}' // Add if needed
  ],
  // ...
};
```

**Plugin not working?** Verify the plugin is imported correctly:
```javascript
// ✅ Correct
import { changerawrMarkdownPlugin } from '@changerawr/markdown/tailwind';

// ❌ Wrong
const plugin = require('@changerawr/markdown/tailwind');
```

## 📦 Complete Examples

### Next.js 14+ (App Router) with Tailwind v4
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}']
}
```

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "@changerawr/markdown/css";
```

### Next.js 13 (Pages) with Tailwind v3
```javascript
// tailwind.config.js
const { changerawrMarkdownPlugin } = require('@changerawr/markdown/tailwind');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  plugins: [changerawrMarkdownPlugin()]
}
```

### Vite + React with Tailwind v4
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  }
})
```

```css
/* src/index.css */
@import "tailwindcss";
@import "@changerawr/markdown/css";
```

## 🌟 Migration Guide

### From v3 Plugin to v4 CSS

1. **Remove plugin from config:**
   ```diff
   - plugins: [changerawrMarkdownPlugin()]
   ```

2. **Add CSS import:**
   ```diff
   + @import "@changerawr/markdown/css";
   ```

3. **Update build process** to handle CSS imports properly

### Benefits of Each Approach

**Tailwind v4 (CSS):**
- ✅ Better tree-shaking
- ✅ Faster builds
- ✅ More explicit dependencies
- ✅ Works with any bundler

**Tailwind v3 (Plugin):**
- ✅ Familiar plugin system
- ✅ Dynamic configuration
- ✅ Existing ecosystem support