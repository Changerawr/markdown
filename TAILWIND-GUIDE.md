# Tailwind Setup Guide

The `@changerawr/markdown` library provides Tailwind CSS integration that works with both Tailwind v3 and v4. Choose the setup method that matches your Tailwind version.

## 🚀 Quick Setup

### Tailwind v4 (CSS Import Method)

**1. Install the package**
```bash
npm install @changerawr/markdown
```

**2. Import styles in your main CSS file**
```css
@import "tailwindcss";
@import "@changerawr/markdown/styles";
```

**3. Use markdown components**
```tsx
import { MarkdownRenderer } from '@changerawr/markdown/react';

function App() {
  return (
    <MarkdownRenderer content="# Hello World\n\nThis **works** perfectly!" />
  );
}
```

### Tailwind v3 (Plugin Method)

**1. Install the package**
```bash
npm install @changerawr/markdown
```

**2. Add to your `tailwind.config.js`**
```javascript
import { changerawrMarkdownPlugin } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    changerawrMarkdownPlugin()
  ]
}
```

**3. Use markdown components**
```tsx
import { MarkdownRenderer } from '@changerawr/markdown/react';

function App() {
  return (
    <MarkdownRenderer content="# Hello World\n\nThis **works** perfectly!" />
  );
}
```

## 🎯 Why You Need This

Without proper setup, Tailwind might purge essential classes like `text-3xl`, `font-bold`, etc. if they're not found in your templates. Our plugin/styles ensure these classes are always available for markdown rendering.

## ⚙️ Custom Configuration

### For Tailwind v4 (CSS Variables)

Create a custom CSS file:

```css
@import "tailwindcss";

/* Custom markdown theme */
@layer utilities {
  :root {
    --changerawr-primary: #3b82f6;
    --changerawr-warning: #f59e0b;
    --changerawr-error: #ef4444;
    --changerawr-success: #10b981;
  }
}

@import "@changerawr/markdown/styles";
```

### For Tailwind v3 (Plugin Options)

```javascript
import { changerawrMarkdownPlugin } from '@changerawr/markdown/tailwind';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    changerawrMarkdownPlugin({
      prefix: 'md',              // Prefix classes with 'md-'
      includeExtensions: true,   // Include alert/button styles
      darkMode: true,           // Include dark mode variants
      colors: {
        primary: '#3b82f6',
        warning: '#f59e0b',
        error: '#ef4444',
        success: '#10b981',
        muted: '#6b7280',
        border: '#d1d5db',
      },
      customClasses: {
        'heading-1': 'text-4xl font-black mb-6',
        'paragraph': 'text-lg leading-relaxed mb-4'
      }
    })
  ]
}
```

## 🎨 Styling Components

### Alert Boxes
The plugin provides styled alert components:

```markdown
:::info Important
This creates a beautiful info alert.
:::

:::warning Watch Out
This creates a warning alert.
:::
```

### Button Components
Styled button elements:

```markdown
[button:Click Me](https://example.com){primary,lg}
[button:Secondary](https://example.com){secondary,md}
```

## 🌙 Dark Mode Support

Both v3 and v4 setups include automatic dark mode support:

```css
/* Automatically included */
.dark .changerawr-text-primary { color: #60a5fa; }
.dark .changerawr-bg-card { background-color: #1f2937; }
```

## 🔧 Advanced Customization

### Custom Color Scheme

**Tailwind v4:**
```css
@layer utilities {
  :root {
    --changerawr-primary: theme(colors.purple.600);
    --changerawr-accent: theme(colors.pink.500);
  }
  
  .dark {
    --changerawr-primary: theme(colors.purple.400);
    --changerawr-accent: theme(colors.pink.400);
  }
}
```

**Tailwind v3:**
```javascript
changerawrMarkdownPlugin({
  colors: {
    primary: 'rgb(147 51 234)', // purple-600
    accent: 'rgb(236 72 153)',  // pink-500
  }
})
```

### Disable Extensions

If you only need basic markdown without alerts/buttons:

**Tailwind v4:**
```css
@import "tailwindcss";
@import "@changerawr/markdown/styles/base"; /* Only base styles */
```

**Tailwind v3:**
```javascript
changerawrMarkdownPlugin({
  includeExtensions: false
})
```

## 📦 Class Reference

The plugin provides these essential classes:

### Typography
- `changerawr-text-3xl`, `changerawr-text-2xl`, `changerawr-text-xl`
- `changerawr-font-bold`, `changerawr-font-semibold`, `changerawr-font-medium`
- `changerawr-italic`, `changerawr-underline`

### Layout
- `changerawr-flex`, `changerawr-items-center`, `changerawr-gap-2`
- `changerawr-mt-8`, `changerawr-mb-4`, `changerawr-leading-7`

### Components
- `changerawr-alert`, `changerawr-alert-info`, `changerawr-alert-warning`
- `changerawr-button`, `changerawr-button-primary`, `changerawr-button-md`

### Colors
- `changerawr-text-primary`, `changerawr-text-muted-foreground`
- `changerawr-bg-card`, `changerawr-border-border`

## 🚨 Troubleshooting

### Styles Not Appearing

**Check your import order:**
```css
/* ✅ Correct order */
@import "tailwindcss";
@import "@changerawr/markdown/styles";

/* ❌ Wrong order */
@import "@changerawr/markdown/styles";
@import "tailwindcss"; /* This overrides our styles */
```