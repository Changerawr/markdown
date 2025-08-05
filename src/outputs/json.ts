/**
 * JSON AST output renderer - returns structured token data
 */

import { ChangerawrMarkdown } from '../engine';
import type { MarkdownToken, EngineConfig, JsonAstNode } from '../types';

/**
 * Parse markdown and return the token array as JSON
 */
export function renderToJSON(markdown: string, config?: Omit<EngineConfig, 'renderer'>): MarkdownToken[] {
    const engine = new ChangerawrMarkdown(config);
    return engine.parse(markdown);
}

/**
 * Parse markdown and return a hierarchical AST structure
 */
export function renderToAST(markdown: string, config?: Omit<EngineConfig, 'renderer'>): JsonAstNode[] {
    const tokens = renderToJSON(markdown, config);
    return tokensToAST(tokens);
}

/**
 * Convert flat token array to hierarchical AST
 */
export function tokensToAST(tokens: MarkdownToken[]): JsonAstNode[] {
    const ast: JsonAstNode[] = [];
    let currentList: JsonAstNode | null = null;
    let currentBlockquote: JsonAstNode | null = null;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!token) continue;

        const node: JsonAstNode = {
            type: token.type,
            content: token.content,
            ...(token.attributes && { attributes: token.attributes })
        };

        // Handle list items - group consecutive list items
        if (token.type === 'list-item' || token.type === 'task-item') {
            if (!currentList) {
                currentList = {
                    type: token.type === 'task-item' ? 'task-list' : 'list',
                    content: '',
                    children: []
                };
                ast.push(currentList);
            }

            if (!currentList.children) {
                currentList.children = [];
            }
            currentList.children.push(node);
            continue;
        } else {
            currentList = null;
        }

        // Handle blockquotes - group consecutive blockquotes
        if (token.type === 'blockquote') {
            if (!currentBlockquote) {
                currentBlockquote = {
                    type: 'blockquote-group',
                    content: '',
                    children: []
                };
                ast.push(currentBlockquote);
            }

            if (!currentBlockquote.children) {
                currentBlockquote.children = [];
            }
            currentBlockquote.children.push(node);
            continue;
        } else {
            currentBlockquote = null;
        }

        // Handle paragraph grouping - merge consecutive text and inline elements
        if (isParagraphContent(token)) {
            const paragraphTokens: MarkdownToken[] = [token];

            // Look ahead for more paragraph content
            let j = i + 1;
            while (j < tokens.length && tokens[j] && isParagraphContent(tokens[j]!)) {
                paragraphTokens.push(tokens[j]!);
                j++;
            }

            // Only create paragraph if we have multiple tokens or text content
            if (paragraphTokens.length > 1 || token.type === 'text') {
                const paragraphNode: JsonAstNode = {
                    type: 'paragraph',
                    content: paragraphTokens.map(t => t.content).join(''),
                    children: paragraphTokens.map(t => ({
                        type: t.type,
                        content: t.content,
                        ...(t.attributes && { attributes: t.attributes })
                    }))
                };
                ast.push(paragraphNode);
                i = j - 1; // Skip the tokens we've processed
                continue;
            }
        }

        // Add standalone nodes
        ast.push(node);
    }

    return ast;
}

/**
 * Convert AST back to flat tokens
 */
export function astToTokens(ast: JsonAstNode[]): MarkdownToken[] {
    const tokens: MarkdownToken[] = [];

    function processNode(node: JsonAstNode): void {
        // Handle container nodes
        if (node.children && node.children.length > 0) {
            // For lists and blockquote groups, process children directly
            if (node.type === 'list' || node.type === 'task-list' || node.type === 'blockquote-group') {
                node.children.forEach(processNode);
                return;
            }

            // For paragraphs, add the paragraph break tokens
            if (node.type === 'paragraph') {
                node.children.forEach((child, index) => {
                    const token: MarkdownToken = {
                        type: child.type,
                        content: child.content,
                        raw: child.content,
                        ...(child.attributes && { attributes: child.attributes })
                    };
                    tokens.push(token);

                    // Add soft breaks between inline elements
                    if (index < node.children!.length - 1 && isInlineToken(child)) {
                        tokens.push({
                            type: 'soft-break',
                            content: ' ',
                            raw: ' '
                        });
                    }
                });

                // Add paragraph break after paragraph
                tokens.push({
                    type: 'paragraph-break',
                    content: '',
                    raw: '\n\n'
                });
                return;
            }
        }

        // Add regular tokens
        const token: MarkdownToken = {
            type: node.type,
            content: node.content,
            raw: node.content,
            ...(node.attributes && { attributes: node.attributes })
        };

        tokens.push(token);
    }

    ast.forEach(processNode);
    return tokens;
}

/**
 * Serialize tokens to JSON string with formatting
 */
export function tokensToJSONString(tokens: MarkdownToken[], pretty = true): string {
    if (pretty) {
        return JSON.stringify(tokens, null, 2);
    }
    return JSON.stringify(tokens);
}

/**
 * Serialize AST to JSON string with formatting
 */
export function astToJSONString(ast: JsonAstNode[], pretty = true): string {
    if (pretty) {
        return JSON.stringify(ast, null, 2);
    }
    return JSON.stringify(ast);
}

/**
 * Parse JSON string back to tokens
 */
export function parseTokensFromJSON(jsonString: string): MarkdownToken[] {
    try {
        const parsed = JSON.parse(jsonString);

        if (!Array.isArray(parsed)) {
            throw new Error('JSON must be an array of tokens');
        }

        // Validate token structure
        for (const token of parsed) {
            if (!token.type || typeof token.type !== 'string') {
                throw new Error('Invalid token structure: missing or invalid type');
            }
            if (token.content === undefined && token.raw === undefined) {
                throw new Error('Invalid token structure: missing content and raw');
            }
        }

        return parsed as MarkdownToken[];
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse tokens from JSON: ${message}`);
    }
}

/**
 * Parse JSON string back to AST
 */
export function parseASTFromJSON(jsonString: string): JsonAstNode[] {
    try {
        const parsed = JSON.parse(jsonString);

        if (!Array.isArray(parsed)) {
            throw new Error('JSON must be an array of AST nodes');
        }

        // Basic validation
        for (const node of parsed) {
            if (!node.type || typeof node.type !== 'string') {
                throw new Error('Invalid AST node: missing or invalid type');
            }
        }

        return parsed as JsonAstNode[];
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse AST from JSON: ${message}`);
    }
}

/**
 * Get comprehensive statistics from parsed tokens
 */
export function getTokenStats(tokens: MarkdownToken[]): TokenStatistics {
    const tokenTypes: Record<string, number> = {};
    const extensionTokens: Record<string, number> = {};
    let totalContent = 0;
    let totalRaw = 0;
    let tokensWithAttributes = 0;

    for (const token of tokens) {
        // Count token types
        tokenTypes[token.type] = (tokenTypes[token.type] || 0) + 1;

        // Count extension tokens (alert, button, embed)
        if (['alert', 'button', 'embed'].includes(token.type)) {
            extensionTokens[token.type] = (extensionTokens[token.type] || 0) + 1;
        }

        // Count content and raw lengths
        totalContent += (token.content || '').length;
        totalRaw += (token.raw || '').length;

        // Count tokens with attributes
        if (token.attributes && Object.keys(token.attributes).length > 0) {
            tokensWithAttributes++;
        }
    }

    const totalTokens = tokens.length;

    return {
        totalTokens,
        tokenTypes,
        extensionTokens,
        totalContent,
        totalRaw,
        tokensWithAttributes,
        averageContentLength: totalTokens > 0 ? Math.round(totalContent / totalTokens) : 0,
        averageRawLength: totalTokens > 0 ? Math.round(totalRaw / totalTokens) : 0,
        attributeUsageRate: totalTokens > 0 ? Math.round((tokensWithAttributes / totalTokens) * 100) : 0
    };
}

/**
 * Get AST-specific statistics
 */
export function getASTStats(ast: JsonAstNode[]): ASTStatistics {
    let totalNodes = 0;
    let maxDepth = 0;
    let nodesWithChildren = 0;
    let totalChildren = 0;
    const nodeTypes: Record<string, number> = {};

    function analyzeNode(node: JsonAstNode, depth = 0): void {
        totalNodes++;
        maxDepth = Math.max(maxDepth, depth);

        // Count node types
        nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;

        // Count children
        if (node.children && node.children.length > 0) {
            nodesWithChildren++;
            totalChildren += node.children.length;

            // Recursively analyze children
            node.children.forEach(child => analyzeNode(child, depth + 1));
        }
    }

    ast.forEach(node => analyzeNode(node));

    return {
        totalNodes,
        maxDepth,
        nodesWithChildren,
        totalChildren,
        nodeTypes,
        averageChildrenPerParent: nodesWithChildren > 0 ? Math.round(totalChildren / nodesWithChildren) : 0,
        hierarchyComplexity: maxDepth > 0 ? Math.round((totalChildren / totalNodes) * maxDepth) : 0
    };
}

/**
 * Compare two token arrays for differences
 */
export function compareTokens(tokensA: MarkdownToken[], tokensB: MarkdownToken[]): TokenComparison {
    const differences: TokenDifference[] = [];
    const maxLength = Math.max(tokensA.length, tokensB.length);

    for (let i = 0; i < maxLength; i++) {
        const tokenA = tokensA[i];
        const tokenB = tokensB[i];

        if (!tokenA && tokenB) {
            differences.push({
                index: i,
                type: 'added',
                tokenB
            });
        } else if (tokenA && !tokenB) {
            differences.push({
                index: i,
                type: 'removed',
                tokenA
            });
        } else if (tokenA && tokenB) {
            if (tokenA.type !== tokenB.type || tokenA.content !== tokenB.content) {
                differences.push({
                    index: i,
                    type: 'modified',
                    tokenA,
                    tokenB
                });
            }
        }
    }

    return {
        identical: differences.length === 0,
        differences,
        addedCount: differences.filter(d => d.type === 'added').length,
        removedCount: differences.filter(d => d.type === 'removed').length,
        modifiedCount: differences.filter(d => d.type === 'modified').length
    };
}

// Helper functions
function isParagraphContent(token: MarkdownToken): boolean {
    return ['text', 'bold', 'italic', 'code', 'link', 'soft-break'].includes(token.type);
}

function isInlineToken(node: JsonAstNode): boolean {
    return ['bold', 'italic', 'code', 'link'].includes(node.type);
}

// Additional type definitions for this module
export interface TokenStatistics {
    totalTokens: number;
    tokenTypes: Record<string, number>;
    extensionTokens: Record<string, number>;
    totalContent: number;
    totalRaw: number;
    tokensWithAttributes: number;
    averageContentLength: number;
    averageRawLength: number;
    attributeUsageRate: number;
}

export interface ASTStatistics {
    totalNodes: number;
    maxDepth: number;
    nodesWithChildren: number;
    totalChildren: number;
    nodeTypes: Record<string, number>;
    averageChildrenPerParent: number;
    hierarchyComplexity: number;
}

export interface TokenDifference {
    index: number;
    type: 'added' | 'removed' | 'modified';
    tokenA?: MarkdownToken;
    tokenB?: MarkdownToken;
}

export interface TokenComparison {
    identical: boolean;
    differences: TokenDifference[];
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
}