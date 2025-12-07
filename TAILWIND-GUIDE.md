# Tailwind Setup Guide for @changerawr/markdown

This guide explains how to configure Tailwind CSS to work with the `@changerawr/markdown` package.

## 🎯 The Problem

The `@changerawr/markdown` package generates HTML with Tailwind utility classes like `text-3xl`, `font-bold`, `mt-8`, etc. However, Tailwind's JIT compiler only includes classes it finds in your source files. Since the markdown rendering happens at runtime, Tailwind doesn't see these classes and won't generate their CSS.

**Result:** Your markdown renders with class names in the HTML, but no actual styles are applied.

## ✅ The Solution

You need to explicitly tell Tailwind to include the markdown classes using a **safelist**.

### Step 1: Install the Package
```bash
npm install @changerawr/markdown
```

### Step 2: Import the Safelist

Update your `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";
import { MARKDOWN_SAFELIST } from '@changerawr/markdown/tailwind';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: MARKDOWN_SAFELIST, // ✅ Add this line
  theme: {
    extend: {
      // your theme customizations
    },
  },
  plugins: [],
};

export default config;
```

### Step 3: Use Markdown Rendering
```typescript
import { ChangerawrMarkdown } from '@changerawr/markdown';

const engine = new ChangerawrMarkdown({
  renderer: { format: 'tailwind' }
});

const html = engine.toHtml('# Hello **World**!');
// <h1 class="text-3xl font-bold mt-8 mb-4">Hello <strong class="font-bold">World</strong>!</h1>
```

That's it! All markdown classes will now be included in your CSS bundle.

## 📋 What Gets Safelisted

The `MARKDOWN_SAFELIST` includes all classes used by the markdown renderer:

- **Typography:** `text-3xl`, `text-2xl`, `font-bold`, `font-semibold`, `italic`, etc.
- **Spacing:** `mt-8`, `mb-4`, `p-4`, `px-2`, `py-1`, etc.
- **Layout:** `flex`, `items-center`, `gap-2`, `relative`, `group`, etc.
- **Lists:** `list-disc`, `list-decimal`, `ml-4`, etc.
- **Borders:** `border-l-4`, `rounded`, `rounded-lg`, etc.
- **Colors:** `text-primary`, `text-muted-foreground`, `bg-muted`, etc.
- **Interactions:** `hover:underline`, `transition-all`, etc.
- **Extensions:** Alert and button classes (blues, ambers, reds, greens)
- **Dark Mode:** `dark:text-blue-400`, `dark:bg-gray-800`, etc.

## 🎨 Custom Theme Colors

If you're using custom theme colors (like `border`, `primary`, `muted`), make sure they're defined in your Tailwind config:
```typescript
const config: Config = {
  safelist: MARKDOWN_SAFELIST,
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // ... other colors
      },
    },
  },
};
```

## 🔧 Advanced: Selective Safelisting

If you want more control over which classes are included, you can import the raw array and filter it:
```typescript
import { MARKDOWN_SAFELIST } from '@changerawr/markdown/tailwind';

const config: Config = {
  safelist: MARKDOWN_SAFELIST.filter(className => {
    // Exclude dark mode classes if you don't need them
    return !className.startsWith('dark:');
  }),
  // ...
};
```

Or create your own safelist by only including what you need:
```typescript
const config: Config = {
  safelist: [
    'text-3xl', 'text-2xl', 'text-xl', 'text-lg',
    'font-bold', 'font-semibold',
    'mt-8', 'mb-4', 'p-4',
    // ... only the classes you use
  ],
  // ...
};
```

## ⚠️ Note About the Plugin

Earlier versions of this package included a `changerawrMarkdownPlugin`. **This plugin does not work** due to limitations in Tailwind's plugin API - plugins cannot inject safelist configuration.

If you see documentation referencing the plugin, ignore it and use `MARKDOWN_SAFELIST` instead:
```typescript
// ❌ Don't use this (it doesn't work)
plugins: [changerawrMarkdownPlugin()]

// ✅ Use this instead
safelist: MARKDOWN_SAFELIST
```

## 🐛 Troubleshooting

### Classes are in the HTML but not styled

**Problem:** You see `class="text-3xl font-bold"` in your HTML, but the text isn't large or bold.

**Solution:** You forgot to add `MARKDOWN_SAFELIST` to your Tailwind config. Go back to Step 2.

### Some classes work, others don't

**Problem:** Basic classes like `font-bold` work, but custom color classes like `text-primary` don't.

**Solution:** Make sure you've defined those colors in your theme (see Custom Theme Colors section above).

### Build is slow with safelist

**Problem:** Your Tailwind build is slower after adding the safelist.

**Solution:** This is expected - you're generating more CSS. The safelist includes ~150 classes. If you need fewer, create a custom filtered list (see Advanced section).

### TypeScript errors importing the safelist

**Problem:** `Cannot find module '@changerawr/markdown/tailwind'`

**Solution:** Make sure you've installed the package and that your `tsconfig.json` includes `"moduleResolution": "bundler"` or `"node16"`.

## 📚 Examples

### Next.js App Router
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { MARKDOWN_SAFELIST } from '@changerawr/markdown/tailwind';

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  safelist: MARKDOWN_SAFELIST,
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

### Vite + React
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { MARKDOWN_SAFELIST } from '@changerawr/markdown/tailwind';

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  safelist: MARKDOWN_SAFELIST,
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

## 💡 Why This Approach?

You might wonder why we use a safelist instead of having Tailwind scan the markdown package's code. Here's why:

1. **The markdown renderer generates HTML at runtime** - Tailwind can't see it during build
2. **Classes are in JavaScript strings** - Tailwind's scanner doesn't parse string concatenation
3. **Safelist is the official Tailwind solution** for dynamic/runtime-generated classes

This is the same approach used by:
- CMS systems with user-generated content
- Dynamic theme builders
- Any library that generates HTML with Tailwind classes at runtime

---

**Questions or issues?** Open an issue on the [@changerawr/markdown GitHub repository](https://github.com/changerawr/markdown).