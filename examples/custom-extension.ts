/**
 * Custom Extension Example
 *
 * Shows how to create custom markdown extensions for specialized use cases.
 * This example creates a "stats card" extension for displaying metrics.
 */

import { ChangerawrMarkdown, type Extension } from '@changerawr/markdown';

// Create a stats card extension
// Usage: [stats:Revenue|$125k|+15% from last month]
const statsExtension: Extension = {
    name: 'stats',
    parseRules: [{
        name: 'stats-card',
        pattern: /\[stats:([^|]+)\|([^|]+)\|([^\]]+)\]/g,
        render: (match) => ({
            type: 'stats-card',
            content: match[0],
            raw: match[0],
            attributes: {
                title: match[1],
                value: match[2],
                subtitle: match[3]
            }
        })
    }],
    renderRules: [{
        type: 'stats-card',
        render: (token) => {
            const { title, value, subtitle } = token.attributes || {};
            return `
        <div class="stats-card bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div class="text-sm font-medium text-gray-500 mb-1">${title}</div>
          <div class="text-3xl font-bold text-gray-900 mb-1">${value}</div>
          <div class="text-sm text-green-600">${subtitle}</div>
        </div>
      `;
        }
    }]
};

// Create a highlight extension for important text
// Usage: ==highlighted text==
const highlightExtension: Extension = {
    name: 'highlight',
    parseRules: [{
        name: 'highlight',
        pattern: /==([^=]+)==/g,
        render: (match) => ({
            type: 'highlight',
            content: match[1],
            raw: match[0]
        })
    }],
    renderRules: [{
        type: 'highlight',
        render: (token) => `<mark class="bg-yellow-200 px-1 rounded">${token.content}</mark>`
    }]
};

// Create a spoiler extension for hidden content
// Usage: ||spoiler text||
const spoilerExtension: Extension = {
    name: 'spoiler',
    parseRules: [{
        name: 'spoiler',
        pattern: /\|\|([^|]+)\|\|/g,
        render: (match) => ({
            type: 'spoiler',
            content: match[1],
            raw: match[0]
        })
    }],
    renderRules: [{
        type: 'spoiler',
        render: (token) => `
      <span class="spoiler bg-gray-800 text-gray-800 hover:text-white cursor-pointer transition-colors rounded px-1" 
            title="Click to reveal">
        ${token.content}
      </span>
    `
    }]
};

// Initialize the engine with our custom extensions
const engine = new ChangerawrMarkdown();

// Register extensions
engine.registerExtension(statsExtension);
engine.registerExtension(highlightExtension);
engine.registerExtension(spoilerExtension);

// Example content using our custom extensions
const sampleContent = `
# Dashboard Report

Here's this month's performance overview:

## Key Metrics

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">

[stats:Total Revenue|$125,430|+15% from last month]

[stats:Active Users|8,247|+8% from last month]

[stats:Conversion Rate|3.2%|-2% from last month]

</div>

## Important Notes

This month we saw ==significant growth== in our user base, particularly in the mobile segment.

However, there are some ||concerning trends in user retention|| that we need to address next quarter.

## Action Items

- Review mobile onboarding flow
- ==Optimize checkout process==
- Investigate retention issues mentioned above

:::info Next Meeting
We'll discuss these findings in detail next Tuesday.
:::
`;

// Render the content
console.log('Rendering dashboard with custom extensions...');
const html = engine.toHtml(sampleContent);

// In a real app, you'd insert this into the DOM
// document.getElementById('content').innerHTML = html;

console.log('Generated HTML:');
console.log(html);

// You can also check which extensions are loaded
console.log('Loaded extensions:', engine.getExtensions());

// Example of conditional extension loading
function createEngineForContext(context: 'blog' | 'dashboard' | 'docs') {
    const contextEngine = new ChangerawrMarkdown();

    switch (context) {
        case 'blog':
            // Only load highlight for blog posts
            contextEngine.registerExtension(highlightExtension);
            break;

        case 'dashboard':
            // Load stats and highlight for dashboards
            contextEngine.registerExtension(statsExtension);
            contextEngine.registerExtension(highlightExtension);
            break;

        case 'docs':
            // Load highlight and spoiler for documentation
            contextEngine.registerExtension(highlightExtension);
            contextEngine.registerExtension(spoilerExtension);
            break;
    }

    return contextEngine;
}

// Usage examples
const blogEngine = createEngineForContext('blog');
const dashboardEngine = createEngineForContext('dashboard');
const docsEngine = createEngineForContext('docs');

export {
    statsExtension,
    highlightExtension,
    spoilerExtension,
    createEngineForContext
};