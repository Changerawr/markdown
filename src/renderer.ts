import type { MarkdownToken, RenderRule, RendererConfig, Extension } from './types';
import { sanitizeHtml, escapeHtml } from './utils';

export class MarkdownRenderer {
    private rules = new Map<string, RenderRule>();
    private warnings: string[] = [];
    private config: RendererConfig;
    private extensions: Extension[] = [];

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

    addExtension(extension: Extension): void {
        this.extensions.push(extension);
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
        let combinedHtml = htmlParts.join('');

        // Apply sanitization BEFORE post-processing
        // This ensures post-processing hooks work on clean, safe HTML
        if (this.config.sanitize && !this.config.allowUnsafeHtml) {
            combinedHtml = sanitizeHtml(combinedHtml);
        }

        // Apply post-processing hooks from extensions AFTER sanitization
        // This allows extensions to add final HTML transformations on the sanitized output
        for (const extension of this.extensions) {
            if (extension.postProcessHtml) {
                try {
                    const processed = extension.postProcessHtml(combinedHtml);
                    // Validate that post-processing returned a string
                    if (typeof processed === 'string') {
                        combinedHtml = processed;
                    } else {
                        this.warnings.push(`Post-processing hook in extension "${extension.name}" did not return a string`);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.warnings.push(`Post-processing error in extension "${extension.name}": ${errorMessage}`);
                    // Continue with original HTML if post-processing fails
                    if (this.config.debugMode) {
                        console.error(`[Renderer] Post-processing failed for ${extension.name}:`, error);
                    }
                }
            }
        }

        return combinedHtml;
    }

    /** Render a token list without sanitization or post-processing hooks. Used for children. */
    private renderTokens(tokens: MarkdownToken[]): string {
        const tokensWithFormat = tokens.map(token => ({
            ...token,
            attributes: { ...token.attributes, format: this.config.format }
        }));
        const grouped = this.groupListItems(tokensWithFormat);
        return grouped.map(token => this.renderToken(token)).join('');
    }

    private static isListItemToken(token?: MarkdownToken): boolean {
        return token?.type === 'list-item' || token?.type === 'ordered-list-item' || token?.type === 'task-item';
    }

    private static isSameListType(typeA: string, typeB: string): boolean {
        const isOrderedA = typeA === 'ordered-list-item';
        const isOrderedB = typeB === 'ordered-list-item';
        return isOrderedA === isOrderedB;
    }

    private groupListItems(tokens: MarkdownToken[]): MarkdownToken[] {
        const result: MarkdownToken[] = [];
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i]!;

            if (MarkdownRenderer.isListItemToken(token)) {
                const indent = (token.attributes?.indent as number) ?? 0;
                const { items, nextIndex } = this.collectListLevel(tokens, i, indent);
                const isOrdered = token.type === 'ordered-list-item';

                const wrappedList: MarkdownToken = {
                    type: isOrdered ? 'ol' : 'ul',
                    content: '',
                    raw: '',
                    children: items,
                    attributes: { format: this.config.format }
                };
                // Mark as already wrapped to prevent double-wrapping
                (wrappedList as any)._isWrapped = true;
                result.push(wrappedList);
                i = nextIndex;
            } else {
                result.push(token);
                i++;
            }
        }

        return result;
    }

    /**
     * Collect consecutive list items at `indentLevel`. Items with greater indent are
     * recursively grouped into a nested ul/ol and appended to the preceding item's
     * children, producing a properly nested list tree.
     */
    private collectListLevel(tokens: MarkdownToken[], start: number, indentLevel: number): { items: MarkdownToken[]; nextIndex: number } {
        const items: MarkdownToken[] = [];
        let i = start;
        let currentType: string | null = null;

        while (i < tokens.length) {
            const item = tokens[i];
            if (!item || !MarkdownRenderer.isListItemToken(item)) break;

            const itemIndent = (item.attributes?.indent as number) ?? 0;

            if (itemIndent < indentLevel) break;

            if (itemIndent > indentLevel && items.length > 0) {
                const nested = this.collectListLevel(tokens, i, itemIndent);
                const isNestedOrdered = item.type === 'ordered-list-item';
                const nestedList: MarkdownToken = {
                    type: isNestedOrdered ? 'ol' : 'ul',
                    content: '',
                    raw: '',
                    children: nested.items,
                    attributes: { format: this.config.format }
                };
                (nestedList as any)._isWrapped = true;

                const lastItem = items[items.length - 1]!;
                lastItem.children = [...(lastItem.children || []), nestedList];

                i = nested.nextIndex;
                continue;
            }

            if (currentType !== null && !MarkdownRenderer.isSameListType(currentType, item.type)) break;

            currentType = item.type;
            items.push(item);
            i++;
        }

        return { items, nextIndex: i };
    }

    private renderToken(token: MarkdownToken): string {
        const rule = this.rules.get(token.type);

        if (rule) {
            try {
                // If token has children, render them and inject into attributes
                let tokenToRender = token;
                if (token.children && token.children.length > 0) {
                    // For wrapper tokens (ul, ol), render children directly without re-grouping.
                    // For other tokens, use renderTokens (skips sanitization) so the top-level
                    // render() call sanitizes only once rather than once per nesting level.
                    const renderedChildren = (token.type === 'ul' || token.type === 'ol')
                        ? token.children.map(child => this.renderToken(child)).join('')
                        : this.renderTokens(token.children);

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

        // If token has children but no render rule, render the children directly
        if (token.children && token.children.length > 0) {
            return this.renderTokens(token.children);
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