import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../src/parser';
import { MarkdownRenderer } from '../src/renderer';
import { CoreExtensions } from '../src/extensions/core';
import type { Extension } from '../src/types';

describe('Recursive Content Parsing', () => {
  it('should recursively parse markdown inside custom extension blocks with recursiveContent flag', () => {
    // Create a custom "callout" extension that needs recursive content parsing
    const calloutExtension: Extension = {
      name: 'callout',
      parseRules: [
        {
          name: 'callout',
          pattern: /::callout\n([\s\S]*?)\n::callout/,
          recursiveContent: true, // Enable recursive parsing
          render: (match: RegExpMatchArray) => {
            return {
              type: 'callout',
              content: match[1]?.trim() || '',
              raw: match[0] || '',
            };
          },
        },
      ],
      renderRules: [
        {
          type: 'callout',
          render: (token) => {
            // Use pre-rendered children if available
            const renderedChildren = token.attributes?.renderedChildren as string | undefined;
            const content = renderedChildren || token.content;
            return `<div class="callout">${content}</div>`;
          },
        },
      ],
    };

    const parser = new MarkdownParser();
    const renderer = new MarkdownRenderer();

    // Register core extensions
    CoreExtensions.forEach(ext => {
      ext.parseRules.forEach(rule => parser.addRule(rule));
      ext.renderRules.forEach(rule => renderer.addRule(rule));
    });

    // Register custom callout extension
    calloutExtension.parseRules.forEach(rule => parser.addRule(rule));
    calloutExtension.renderRules.forEach(rule => renderer.addRule(rule));

    const markdown = `::callout
This is **bold** and *italic* text with a [link](https://example.com).

- List item 1
- List item 2
::callout`;

    const tokens = parser.parse(markdown);
    const html = renderer.render(tokens);

    // Should render the markdown inside the callout block
    expect(html).toContain('<strong');  // May have Tailwind classes
    expect(html).toContain('bold</strong>');
    expect(html).toContain('<em');
    expect(html).toContain('italic</em>');
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('link');
    expect(html).toContain('</a>');
    expect(html).toContain('<ul');
    expect(html).toContain('<li>List item 1</li>');
    expect(html).toContain('<li>List item 2</li>');
    expect(html).toContain('</ul>');
    expect(html).toContain('<div class="callout">');
  });

  it('should NOT recursively parse markdown without recursiveContent flag', () => {
    // Create a custom "code-container" extension that should NOT parse content
    const codeContainerExtension: Extension = {
      name: 'code-container',
      parseRules: [
        {
          name: 'code-container',
          pattern: /::code\n([\s\S]*?)\n::code/,
          // NO recursiveContent flag - content should remain raw
          render: (match: RegExpMatchArray) => {
            return {
              type: 'code-container',
              content: match[1]?.trim() || '',
              raw: match[0] || '',
            };
          },
        },
      ],
      renderRules: [
        {
          type: 'code-container',
          render: (token) => {
            // Content should be raw, not parsed
            return `<pre><code>${token.content}</code></pre>`;
          },
        },
      ],
    };

    const parser = new MarkdownParser();
    const renderer = new MarkdownRenderer();

    // Register core extensions
    CoreExtensions.forEach(ext => {
      ext.parseRules.forEach(rule => parser.addRule(rule));
      ext.renderRules.forEach(rule => renderer.addRule(rule));
    });

    // Register custom code-container extension
    codeContainerExtension.parseRules.forEach(rule => parser.addRule(rule));
    codeContainerExtension.renderRules.forEach(rule => renderer.addRule(rule));

    const markdown = `::code
This is **bold** and *italic* text.
::code`;

    const tokens = parser.parse(markdown);
    const html = renderer.render(tokens);

    // Should NOT render the markdown - should show raw text
    expect(html).not.toContain('<strong>');
    expect(html).not.toContain('<em>');
    expect(html).toContain('**bold**');
    expect(html).toContain('*italic*');
    expect(html).toContain('<pre><code>');
  });

  it('should handle nested markdown with multiple levels', () => {
    const spoilerExtension: Extension = {
      name: 'spoiler',
      parseRules: [
        {
          name: 'spoiler',
          pattern: /:::spoiler(?: ([^\n]+))?\n([\s\S]*?)\n:::/,
          recursiveContent: true,
          render: (match: RegExpMatchArray) => {
            return {
              type: 'spoiler',
              content: match[2]?.trim() || '',
              raw: match[0] || '',
              attributes: {
                title: match[1]?.trim() || 'Spoiler',
              },
            };
          },
        },
      ],
      renderRules: [
        {
          type: 'spoiler',
          render: (token) => {
            const title = token.attributes?.title || 'Spoiler';
            const renderedChildren = token.attributes?.renderedChildren as string | undefined;
            const content = renderedChildren || token.content;
            return `<details><summary>${title}</summary><div>${content}</div></details>`;
          },
        },
      ],
    };

    const parser = new MarkdownParser();
    const renderer = new MarkdownRenderer();

    // Register core extensions
    CoreExtensions.forEach(ext => {
      ext.parseRules.forEach(rule => parser.addRule(rule));
      ext.renderRules.forEach(rule => renderer.addRule(rule));
    });

    // Register custom spoiler extension
    spoilerExtension.parseRules.forEach(rule => parser.addRule(rule));
    spoilerExtension.renderRules.forEach(rule => renderer.addRule(rule));

    const markdown = `:::spoiler Plot Twist
The main character discovers:

1. They have **superpowers**
2. Their *best friend* is a villain
3. Everything is a \`simulation\`

> Mind = Blown
:::`;

    const tokens = parser.parse(markdown);
    const html = renderer.render(tokens);

    // Should render all nested markdown
    expect(html).toContain('<details>');
    expect(html).toContain('<summary>Plot Twist</summary>');
    expect(html).toContain('<strong');
    expect(html).toContain('superpowers</strong>');
    expect(html).toContain('<em');
    expect(html).toContain('best friend</em>');
    expect(html).toContain('<code');
    expect(html).toContain('simulation</code>');
    expect(html).toContain('<blockquote');
    expect(html).toContain('Mind = Blown');
    expect(html).toContain('<ol');
    expect(html).toContain('</ol>');
  });

  it('should work with colored spoiler syntax', () => {
    const spoilerExtension: Extension = {
      name: 'spoiler',
      parseRules: [
        {
          name: 'spoiler',
          pattern: /:::spoiler(?:\{([^}]+)\})?(?: ([^\n]+))?\n([\s\S]*?)\n:::/,
          recursiveContent: true,
          render: (match: RegExpMatchArray) => {
            return {
              type: 'spoiler',
              content: match[3]?.trim() || '',
              raw: match[0] || '',
              attributes: {
                color: match[1]?.trim() || 'default',
                title: match[2]?.trim() || 'Spoiler',
              },
            };
          },
        },
      ],
      renderRules: [
        {
          type: 'spoiler',
          render: (token) => {
            const color = token.attributes?.color || 'default';
            const title = token.attributes?.title || 'Spoiler';
            const renderedChildren = token.attributes?.renderedChildren as string | undefined;
            const content = renderedChildren || token.content;
            return `<details class="${color}"><summary>${title}</summary><div>${content}</div></details>`;
          },
        },
      ],
    };

    const parser = new MarkdownParser();
    const renderer = new MarkdownRenderer();

    // Register core extensions
    CoreExtensions.forEach(ext => {
      ext.parseRules.forEach(rule => parser.addRule(rule));
      ext.renderRules.forEach(rule => renderer.addRule(rule));
    });

    // Register custom spoiler extension
    spoilerExtension.parseRules.forEach(rule => parser.addRule(rule));
    spoilerExtension.renderRules.forEach(rule => renderer.addRule(rule));

    const markdown = `:::spoiler{red} Warning
This contains **dangerous** information with *emphasis*.
:::`;

    const tokens = parser.parse(markdown);
    const html = renderer.render(tokens);

    expect(html).toContain('class="red"');
    expect(html).toContain('<summary>Warning</summary>');
    expect(html).toContain('<strong');
    expect(html).toContain('dangerous</strong>');
    expect(html).toContain('<em');
    expect(html).toContain('emphasis</em>');
  });

  it('should handle multiple recursive blocks in same document', () => {
    const calloutExtension: Extension = {
      name: 'callout',
      parseRules: [
        {
          name: 'callout',
          pattern: /::callout\n([\s\S]*?)\n::callout/,
          recursiveContent: true,
          render: (match: RegExpMatchArray) => {
            return {
              type: 'callout',
              content: match[1]?.trim() || '',
              raw: match[0] || '',
            };
          },
        },
      ],
      renderRules: [
        {
          type: 'callout',
          render: (token) => {
            const renderedChildren = token.attributes?.renderedChildren as string | undefined;
            const content = renderedChildren || token.content;
            return `<div class="callout">${content}</div>`;
          },
        },
      ],
    };

    const parser = new MarkdownParser();
    const renderer = new MarkdownRenderer();

    // Register core extensions
    CoreExtensions.forEach(ext => {
      ext.parseRules.forEach(rule => parser.addRule(rule));
      ext.renderRules.forEach(rule => renderer.addRule(rule));
    });

    // Register custom callout extension
    calloutExtension.parseRules.forEach(rule => parser.addRule(rule));
    calloutExtension.renderRules.forEach(rule => renderer.addRule(rule));

    const markdown = `::callout
First block with **bold** text.
::callout

Some regular text between blocks.

::callout
Second block with *italic* text and a [link](https://example.com).
::callout`;

    const tokens = parser.parse(markdown);
    const html = renderer.render(tokens);

    expect(html).toContain('<strong');
    expect(html).toContain('bold</strong>');
    expect(html).toContain('<em');
    expect(html).toContain('italic</em>');
    expect(html).toContain('<a href="https://example.com"');
    expect(html.match(/<div class="callout">/g)).toHaveLength(2);
  });
});
