import type { MarkdownToken, RenderRule, RendererConfig } from './types';
import { sanitizeHtml, escapeHtml, generateId } from './utils';

export class MarkdownRenderer {
    private rules = new Map<string, RenderRule>();
    private warnings: string[] = [];
    private config: RendererConfig;

    constructor(config?: RendererConfig) {
        this.config = {
            format: 'tailwind',
            sanitize: true,
            allowUnsafeHtml: false,
            debugMode: false,
            ...config
        };
        this.setupDefaultRules();
    }

    addRule(rule: RenderRule): void {
        this.rules.set(rule.type, rule);
    }

    hasRule(type: string): boolean {
        return this.rules.has(type);
    }

    render(tokens: MarkdownToken[]): string {
        this.warnings = [];

        // Render each token
        const htmlParts = tokens.map(token => this.renderToken(token));
        const combinedHtml = htmlParts.join('');

        // Apply sanitization if enabled
        if (this.config.sanitize && !this.config.allowUnsafeHtml) {
            return sanitizeHtml(combinedHtml);
        }

        return combinedHtml;
    }

    getWarnings(): string[] {
        return [...this.warnings];
    }

    getConfig(): RendererConfig {
        return { ...this.config };
    }

    updateConfig(config: Partial<RendererConfig>): void {
        this.config = { ...this.config, ...config };
    }

    setDebugMode(enabled: boolean): void {
        this.config.debugMode = enabled;
    }

    clearWarnings(): void {
        this.warnings = [];
    }

    private renderToken(token: MarkdownToken): string {
        const rule = this.rules.get(token.type);

        if (rule) {
            try {
                return rule.render(token);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.warnings.push(`Render error for ${token.type}: ${errorMessage}`);
                return this.createErrorBlock(`Render error for ${token.type}: ${errorMessage}`);
            }
        }

        // For text tokens, just return the content
        if (token.type === 'text') {
            return escapeHtml(token.content || token.raw || '');
        }

        // For unknown types in development, show debug info
        if (this.config.debugMode) {
            return this.createDebugBlock(token);
        }

        // In production, return the content safely - this might be the issue
        return escapeHtml(token.content || token.raw || '');
    }

    private createErrorBlock(message: string): string {
        if (this.config.format === 'html') {
            return `<div style="background-color: #fee; border: 1px solid #fcc; color: #c66; padding: 8px; border-radius: 4px; margin: 8px 0; font-size: 14px;">
        <strong>Render Error:</strong> ${escapeHtml(message)}
      </div>`;
        }

        return `<div class="bg-red-100 border border-red-300 text-red-800 p-2 rounded text-sm mb-2">
      <strong>Render Error:</strong> ${escapeHtml(message)}
    </div>`;
    }

    private createDebugBlock(token: MarkdownToken): string {
        if (this.config.format === 'html') {
            return `<div style="background-color: #fffbf0; border: 1px solid #fed; color: #b8860b; padding: 8px; border-radius: 4px; margin: 8px 0; font-size: 14px;">
        <strong>Unknown token type:</strong> ${escapeHtml(token.type)}<br>
        <strong>Content:</strong> ${escapeHtml(token.content || token.raw || '')}
      </div>`;
        }

        return `<div class="bg-yellow-100 border border-yellow-300 text-yellow-800 p-2 rounded text-sm mb-2">
      <strong>Unknown token type:</strong> ${escapeHtml(token.type)}<br>
      <strong>Content:</strong> ${escapeHtml(token.content || token.raw || '')}
    </div>`;
    }

    private setupDefaultRules(): void {
        this.addRule({
            type: 'heading',
            render: (token) => {
                const level = parseInt(token.attributes?.level || '1');
                const text = token.content;
                const id = generateId(text);
                const escapedContent = escapeHtml(text);

                if (this.config.format === 'html') {
                    return `<h${level} id="${id}">${escapedContent}</h${level}>`;
                }

                let headingClasses = 'group relative flex items-center gap-2';

                switch (level) {
                    case 1:
                        headingClasses += ' text-3xl font-bold mt-8 mb-4';
                        break;
                    case 2:
                        headingClasses += ' text-2xl font-semibold mt-6 mb-3';
                        break;
                    case 3:
                        headingClasses += ' text-xl font-medium mt-5 mb-3';
                        break;
                    case 4:
                        headingClasses += ' text-lg font-medium mt-4 mb-2';
                        break;
                    case 5:
                        headingClasses += ' text-base font-medium mt-3 mb-2';
                        break;
                    case 6:
                        headingClasses += ' text-sm font-medium mt-3 mb-2';
                        break;
                }

                return `<h${level} id="${id}" class="${headingClasses}">
          ${escapedContent}
          <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.5 4H5.75A3.75 3.75 0 002 7.75v.5a3.75 3.75 0 003.75 3.75h1.5m-1.5-4h3m1.5-4h1.75A3.75 3.75 0 0114 7.75v.5a3.75 3.75 0 01-3.75 3.75H8.5"/>
            </svg>
          </a>
        </h${level}>`;
            }
        });

        this.addRule({
            type: 'bold',
            render: (token) => {
                const content = escapeHtml(token.content);
                if (this.config.format === 'html') {
                    return `<strong>${content}</strong>`;
                }
                return `<strong class="font-bold">${content}</strong>`;
            }
        });

        this.addRule({
            type: 'italic',
            render: (token) => {
                const content = escapeHtml(token.content);
                if (this.config.format === 'html') {
                    return `<em>${content}</em>`;
                }
                return `<em class="italic">${content}</em>`;
            }
        });

        this.addRule({
            type: 'code',
            render: (token) => {
                const content = escapeHtml(token.content);
                if (this.config.format === 'html') {
                    return `<code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.875rem;">${content}</code>`;
                }
                return `<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">${content}</code>`;
            }
        });

        this.addRule({
            type: 'codeblock',
            render: (token) => {
                const language = token.attributes?.language || 'text';
                const escapedCode = escapeHtml(token.content);

                if (this.config.format === 'html') {
                    return `<pre style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 16px 0;"><code class="language-${escapeHtml(language)}">${escapedCode}</code></pre>`;
                }

                return `<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code class="language-${escapeHtml(language)}">${escapedCode}</code></pre>`;
            }
        });

        this.addRule({
            type: 'link',
            render: (token) => {
                const href = token.attributes?.href || '#';
                const escapedHref = escapeHtml(href);
                const escapedText = escapeHtml(token.content);

                if (this.config.format === 'html') {
                    return `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer">${escapedText}</a>`;
                }

                return `<a href="${escapedHref}" class="text-primary hover:underline inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
          ${escapedText}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>`;
            }
        });

        this.addRule({
            type: 'list-item',
            render: (token) => `<li>${escapeHtml(token.content)}</li>`
        });

        this.addRule({
            type: 'blockquote',
            render: (token) => {
                const content = escapeHtml(token.content);
                if (this.config.format === 'html') {
                    return `<blockquote style="border-left: 2px solid #d1d5db; padding: 8px 0 8px 16px; margin: 16px 0; font-style: italic; color: #6b7280;">${content}</blockquote>`;
                }
                return `<blockquote class="pl-4 py-2 border-l-2 border-border italic text-muted-foreground my-4">${content}</blockquote>`;
            }
        });

        this.addRule({
            type: 'text',
            render: (token) => {
                if (!token.content) return '';
                return escapeHtml(token.content);
            }
        });

        this.addRule({
            type: 'paragraph',
            render: (token) => {
                if (!token.content) return '';
                const content = token.content.trim();
                if (!content) return '';

                const processedContent = content.includes('<br>') ? content : escapeHtml(content);

                if (this.config.format === 'html') {
                    return `<p style="line-height: 1.75; margin-bottom: 16px;">${processedContent}</p>`;
                }

                return `<p class="leading-7 mb-4">${processedContent}</p>`;
            }
        });

        this.addRule({
            type: 'task-item',
            render: (token) => {
                const isChecked = token.attributes?.checked === 'true';
                const escapedContent = escapeHtml(token.content);

                if (this.config.format === 'html') {
                    return `<div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
            <input type="checkbox" ${isChecked ? 'checked' : ''} disabled style="margin: 0;" />
            <span${isChecked ? ' style="text-decoration: line-through; color: #6b7280;"' : ''}>${escapedContent}</span>
          </div>`;
                }

                return `<div class="flex items-center gap-2 my-2 task-list-item">
          <input type="checkbox" ${isChecked ? 'checked' : ''} disabled 
            class="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <span${isChecked ? ' class="line-through text-muted-foreground"' : ''}>${escapedContent}</span>
        </div>`;
            }
        });

        this.addRule({
            type: 'image',
            render: (token) => {
                const src = token.attributes?.src || '';
                const alt = token.attributes?.alt || '';
                const title = token.attributes?.title || '';
                const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';

                if (this.config.format === 'html') {
                    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" loading="lazy" />`;
                }

                return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} class="max-w-full h-auto rounded-lg my-4" loading="lazy" />`;
            }
        });

        this.addRule({
            type: 'hr',
            render: () => {
                if (this.config.format === 'html') {
                    return '<hr style="margin: 24px 0; border: none; border-top: 1px solid #d1d5db;">';
                }
                return '<hr class="my-6 border-t border-border">';
            }
        });

        // Line break handling
        this.addRule({
            type: 'line-break',
            render: () => '<br>'
        });

        this.addRule({
            type: 'paragraph-break',
            render: () => '</p><p>'
        });

        this.addRule({
            type: 'soft-break',
            render: (token) => token.content || ' '
        });
    }
}