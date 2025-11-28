import type { MarkdownToken, RenderRule, RendererConfig } from './types';
import { sanitizeHtml, escapeHtml } from './utils';

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
    }

    addRule(rule: RenderRule): void {
        this.rules.set(rule.type, rule);
    }

    hasRule(type: string): boolean {
        return this.rules.has(type);
    }

    render(tokens: MarkdownToken[]): string {
        this.warnings = [];

        // Inject format into each token for extensions to use
        const tokensWithFormat = tokens.map(token => ({
            ...token,
            attributes: {
                ...token.attributes,
                format: this.config.format
            }
        }));

        // Group consecutive list items into ul/ol wrappers
        const groupedTokens = this.groupListItems(tokensWithFormat);

        // Render each token using registered extensions
        const htmlParts = groupedTokens.map(token => this.renderToken(token));
        const combinedHtml = htmlParts.join('');

        // Apply sanitization if enabled
        if (this.config.sanitize && !this.config.allowUnsafeHtml) {
            return sanitizeHtml(combinedHtml);
        }

        return combinedHtml;
    }

    private groupListItems(tokens: MarkdownToken[]): MarkdownToken[] {
        const result: MarkdownToken[] = [];
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i]!;
            const isListItem = token?.type === 'list-item' || token?.type === 'ordered-list-item' || token?.type === 'task-item';

            if (isListItem) {
                // Collect all consecutive list items at this level
                const listItems: MarkdownToken[] = [];
                const firstItemType = token.type;
                const isOrdered = firstItemType === 'ordered-list-item';

                while (i < tokens.length) {
                    const item = tokens[i];
                    if (!item) break;

                    const itemType = item.type;
                    const isSameListType = (isOrdered && itemType === 'ordered-list-item') ||
                                          (!isOrdered && (itemType === 'list-item' || itemType === 'task-item'));

                    if (isSameListType) {
                        listItems.push(item);
                        i++;
                    } else {
                        break;
                    }
                }

                // Wrap list items in ul or ol (only happens once per grouping call)
                const wrappedList: MarkdownToken = {
                    type: isOrdered ? 'ol' : 'ul',
                    content: '',
                    raw: '',
                    children: listItems,
                    attributes: { format: this.config.format }
                };
                // Mark as already wrapped to prevent double-wrapping
                (wrappedList as any)._isWrapped = true;
                result.push(wrappedList);
            } else {
                result.push(token);
                i++;
            }
        }

        return result;
    }

    private renderToken(token: MarkdownToken): string {
        const rule = this.rules.get(token.type);

        if (rule) {
            try {
                // If token has children, render them and inject into attributes
                let tokenToRender = token;
                if (token.children && token.children.length > 0) {
                    // For wrapper tokens (ul, ol), render children directly without re-grouping
                    // For other tokens with children, render through full pipeline to handle nested content
                    const renderedChildren = (token.type === 'ul' || token.type === 'ol')
                        ? token.children.map(child => this.renderToken(child)).join('')
                        : this.render(token.children);

                    tokenToRender = {
                        ...token,
                        attributes: {
                            ...token.attributes,
                            renderedChildren  // Extensions can use this instead of re-parsing
                        }
                    };
                }

                return rule.render(tokenToRender);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.warnings.push(`Render error for ${token.type}: ${errorMessage}`);
                return this.createErrorBlock(`Render error for ${token.type}: ${errorMessage}`);
            }
        }

        // For unknown types in development, show debug info
        if (this.config.debugMode) {
            return this.createDebugBlock(token);
        }

        // Fallback: treat as text if no rule found
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
}