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

### Tailwind v3 (Plugin + Safelist Method)

For Tailwind v3, use the plugin AND safelist to ensure dynamically-generated classes aren't purged.

**1. Install the package**
```bash
npm install @changerawr/markdown
```

**2. Add plugin and safelist to your `tailwind.config.js`**
```javascript
import { changerawrMarkdownPlugin, getSafelist } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  safelist: getSafelist({
    includeExtensions: true,   // Include alert/button styles
    darkMode: true            // Include dark mode variants
  }),
  plugins: [
    changerawrMarkdownPlugin({
      includeExtensions: true,
      darkMode: true
    })
  ]
}
```

> **Why both?** The plugin provides the config merge, while the safelist ensures dynamically-generated classes (like `bg-purple-500/10` for alerts) are included in the build. Without the safelist, Tailwind's JIT compiler would purge classes that are built at runtime with string concatenation.

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

Markdown components generate classes **dynamically at runtime** using string concatenation (e.g., `'bg-' + color + '-500/10'`). Tailwind's JIT compiler can't detect these classes by scanning your source files, so it would normally purge them from the production build.

Our solution uses two approaches:
1. **Tailwind v4**: Pre-compiled CSS with all component classes defined explicitly
2. **Tailwind v3**: Safelist configuration that tells Tailwind which dynamic classes to keep

### The Problem with Dynamic Classes

```typescript
// ❌ Tailwind JIT can't detect these classes
const type = 'info';
const classes = `bg-${type === 'info' ? 'blue' : 'red'}-500/10`;

// ❌ Also problematic - arbitrary values
const buttonClasses = `scale-[1.02] shadow-[0_1px_0_0_rgba(255,255,255,0.1)]`;

// ✅ Solution: Use safelist (v3) or pre-compiled CSS (v4)
```

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

### Tailwind v3 (Plugin + Safelist Options)

```javascript
import { changerawrMarkdownPlugin, getSafelist } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  safelist: getSafelist({
    includeExtensions: false,  // Disable alert/button styles
    darkMode: false           // Disable dark mode variants
  }),
  plugins: [
    changerawrMarkdownPlugin({
      includeExtensions: false,
      darkMode: false
    })
  ]
}
```

**What the safelist includes:**

With `includeExtensions: true`:
- All 6 alert types: info (blue), warning (amber), error (red), success (green), tip (purple), note (gray)
- All 7 button styles: default, primary, secondary, success, danger, outline, ghost
- Button arbitrary values: `scale-[1.02]`, `scale-[0.98]`, complex box shadows
- Pseudo-element classes: `before:absolute`, `before:opacity-0`, `hover:before:opacity-100`, etc.
- All color variants and opacity modifiers: `bg-blue-500/10`, `border-blue-500/30`, etc.

With `includeExtensions: false`:
- Only core markdown classes (typography, spacing, layout)
- No alert or button extension classes

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

First, make sure you're using BOTH the plugin AND safelist:
```javascript
import { changerawrMarkdownPlugin, getSafelist } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  safelist: getSafelist(), // ⚠️ Don't forget this!
  plugins: [changerawrMarkdownPlugin()]
}
```

**Still having issues?** Check if you're using the correct color variants:
```javascript
// ✅ Supported colors (safelisted)
bg-blue-500/10      // Alert info
bg-amber-500/10     // Alert warning
bg-red-500/10       // Alert error
bg-green-500/10     // Alert success
bg-purple-500/10    // Alert tip
bg-gray-500/10      // Alert note

// ❌ Not safelisted (will be purged)
bg-pink-500/10      // Custom color
bg-teal-500/10      // Custom color
```

**Adding custom alert types?** Extend the safelist:
```javascript
export default {
  safelist: [
    ...getSafelist(),
    // Add your custom classes
    'bg-pink-500/10',
    'border-pink-500/30',
    'text-pink-600',
    'border-l-pink-500'
  ],
  // ...
}
```

**Plugin not working?** Verify the imports are correct:
```javascript
// ✅ Correct (ES modules)
import { changerawrMarkdownPlugin, getSafelist } from '@changerawr/markdown/tailwind';

// ⚠️ CommonJS (use if you must)
const { changerawrMarkdownPlugin, getSafelist } = require('@changerawr/markdown/tailwind');
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
const { changerawrMarkdownPlugin, getSafelist } = require('@changerawr/markdown/tailwind');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  safelist: getSafelist(),
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

### Upgrading from Old Plugin (Pre-Safelist)

If you were using an older version without the safelist, you need to add it:

```diff
// tailwind.config.js
- import { changerawrMarkdownPlugin } from '@changerawr/markdown/tailwind';
+ import { changerawrMarkdownPlugin, getSafelist } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
+ safelist: getSafelist(),
  plugins: [changerawrMarkdownPlugin()]
}
```

**Why?** The old plugin tried to "preserve" classes using CSS custom properties, but this approach:
- ❌ Doesn't work with Tailwind v4
- ❌ Doesn't handle arbitrary values like `scale-[1.02]`
- ❌ Misses some color variants (purple, gray)
- ❌ Can't handle pseudo-element classes properly

The new safelist approach:
- ✅ Works with both Tailwind v3 and v4
- ✅ Explicitly lists ALL classes including arbitrary values
- ✅ Covers all 6 alert types and 7 button styles
- ✅ Handles pseudo-elements, opacity modifiers, and complex selectors

### From v3 Plugin to v4 CSS

1. **Remove plugin and safelist from config:**
   ```diff
   - import { changerawrMarkdownPlugin, getSafelist } from '@changerawr/markdown/tailwind';

   export default {
     content: ['./src/**/*.{js,ts,jsx,tsx}'],
   - safelist: getSafelist(),
   - plugins: [changerawrMarkdownPlugin()]
   }
   ```

2. **Add CSS import:**
   ```css
   /* src/app/globals.css */
   @import "tailwindcss";
   @import "@changerawr/markdown/css";
   ```

3. **Update build process** to handle CSS imports properly

### Benefits of Each Approach

**Tailwind v4 (CSS):**
- ✅ Better tree-shaking
- ✅ Faster builds
- ✅ More explicit dependencies
- ✅ Works with any bundler
- ✅ No safelist needed (classes pre-compiled)
- ✅ Future-proof for Tailwind v4+

**Tailwind v3 (Plugin + Safelist):**
- ✅ Familiar plugin system
- ✅ Dynamic configuration
- ✅ Existing ecosystem support
- ✅ Works with current Tailwind v3 projects
- ⚠️ Requires both plugin AND safelist