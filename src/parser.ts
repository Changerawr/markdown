import type { MarkdownToken, ParseRule, ParserConfig } from './types';

export class MarkdownParser {
    private rules: ParseRule[] = [];
    private blockRules: ParseRule[] = [];   // scope === 'block' or 'both' (or unset)
    private inlineRules: ParseRule[] = [];  // scope === 'inline' or 'both' (or unset)
    private warnings: string[] = [];
    private config: ParserConfig;
    private compiledPatterns = new Map<ParseRule, RegExp>();

    constructor(config?: ParserConfig) {
        this.config = {
            debugMode: false,
            maxIterations: 10000,
            validateMarkdown: false,
            ...config
        };
    }

    addRule(rule: ParseRule): void {
        this.rules.push(rule);
        this.compiledPatterns.set(
            rule,
            new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', ''))
        );

        // Partition into block/inline lists based on scope.
        // Unscoped rules go into both lists for backwards compatibility.
        const scope = rule.scope;
        if (scope === 'block' || scope === 'both' || !scope) {
            this.blockRules.push(rule);
        }
        if (scope === 'inline' || scope === 'both' || !scope) {
            this.inlineRules.push(rule);
        }

        const sorter = (a: ParseRule, b: ParseRule) => {
            const aPriority = a.priority !== undefined ? a.priority : this.calculatePatternPriority(a);
            const bPriority = b.priority !== undefined ? b.priority : this.calculatePatternPriority(b);
            if (aPriority !== bPriority) return bPriority - aPriority;
            return a.name.localeCompare(b.name);
        };
        this.rules.sort(sorter);
        this.blockRules.sort(sorter);
        this.inlineRules.sort(sorter);
    }

    /**
     * Calculate pattern priority automatically based on pattern complexity.
     * Higher priority = more specific pattern = processed first.
     */
    private calculatePatternPriority(rule: ParseRule): number {
        const pattern = rule.pattern.source;
        let score = 100;

        const isMultiLine = /\\n|\[\\s\\S\]|\[\\S\\s\]/.test(pattern);
        if (isMultiLine) score += 500;

        const literalChars = pattern.replace(/\\[^a-zA-Z0-9]|[\[\](){}|^$.*+?]/g, '');
        score += literalChars.length * 10;

        const consecutiveLiterals = pattern.match(/[a-zA-Z0-9:=`!@#$%&_-]{2,}/g) || [];
        score += consecutiveLiterals.reduce((sum, seq) => sum + (seq.length * 20), 0);

        if (pattern.startsWith('^')) score += 100;
        if (pattern.endsWith('$')) score += 100;

        const boundaryCount = (pattern.match(/\\b/g) || []).length;
        score += boundaryCount * 30;

        const greedyWildcards = (pattern.match(/\.\*|\.\+/g) || []).length;
        score -= greedyWildcards * 50;

        const negatedClasses = (pattern.match(/\[\^[^\]]+\]/g) || []).length;
        score += negatedClasses * 40;

        const lookarounds = (pattern.match(/\(\?[=!<]/g) || []).length;
        score += lookarounds * 100;

        if (rule.name === 'text' || rule.name === 'paragraph' || rule.name === 'line-break') {
            score = 10;
        }

        return Math.max(0, score);
    }

    hasRule(name: string): boolean {
        return this.rules.some(rule => rule.name === name);
    }

    /** Run only block-scoped rules. Returns block tokens plus raw text tokens between them. */
    parseBlocks(markdown: string): MarkdownToken[] {
        if (!markdown.trim()) return [];
        const preprocessed = this.preprocessMarkdown(markdown);
        return this.parseWithRules(preprocessed, this.blockRules);
    }

    /** Run only inline-scoped rules inside a piece of text. */
    parseInlines(text: string): MarkdownToken[] {
        if (!text) return [];
        return this.parseWithRules(text, this.inlineRules);
    }

    /**
     * Two-phase parse:
     * 1. Block phase: find headings, lists, codeblocks, etc.
     * 2. Inline phase: parse content inside each block token + synthesize paragraphs from leftover text.
     */
    parse(markdown: string): MarkdownToken[] {
        this.warnings = [];

        if (!markdown.trim()) return [];

        if (this.rules.length === 0) {
            this.warnings.push('No parse rules registered - consider using CoreExtensions');
            return [{ type: 'text', content: markdown, raw: markdown }];
        }

        const preprocessed = this.preprocessMarkdown(markdown);
        const blockTokens = this.parseWithRules(preprocessed, this.blockRules);
        return this.synthesizeAndInlineParse(blockTokens);
    }

    /**
     * Merge consecutive text tokens from block phase into paragraph tokens,
     * and inline-parse the content of all block tokens.
     */
    private synthesizeAndInlineParse(blockTokens: MarkdownToken[]): MarkdownToken[] {
        const result: MarkdownToken[] = [];
        let i = 0;

        while (i < blockTokens.length) {
            const token = blockTokens[i]!;

            if (token.type === 'text') {
                // Collect consecutive text tokens
                let textContent = token.content || token.raw || '';
                let j = i + 1;
                while (j < blockTokens.length && blockTokens[j]?.type === 'text') {
                    textContent += blockTokens[j]!.content || blockTokens[j]!.raw || '';
                    j++;
                }
                i = j;

                // Split on blank lines to produce separate paragraph tokens
                const paragraphSegments = textContent.split(/\n{2,}/);
                for (const segment of paragraphSegments) {
                    const trimmed = segment.trim();
                    if (trimmed) {
                        result.push({
                            type: 'paragraph',
                            content: trimmed,
                            raw: segment,
                            children: this.parseInlines(trimmed)
                        });
                    }
                }
            } else {
                result.push(this.inlineParseBlockContent(token));
                i++;
            }
        }

        return result;
    }

    /**
     * Inline-parse a block token's content into children.
     * Code tokens are skipped — their content must remain literal.
     */
    private inlineParseBlockContent(token: MarkdownToken): MarkdownToken {
        if (token.type === 'codeblock' || token.type === 'code') return token;
        const content = token.content;
        if (!content?.trim()) return token;
        return { ...token, children: this.parseInlines(content) };
    }

    /**
     * Core parse loop — reused by parseBlocks, parseInlines, and parse.
     * Scans `text` using the provided rule list and returns a flat token array
     * with consecutive text tokens merged.
     */
    private parseWithRules(text: string, rules: ParseRule[]): MarkdownToken[] {
        const tokens: MarkdownToken[] = [];
        let remaining = text;
        let iterationCount = 0;
        const maxIterations = this.config.maxIterations || 10000;

        while (remaining.length > 0 && iterationCount < maxIterations) {
            iterationCount++;
            let bestMatch: { rule: ParseRule; match: RegExpMatchArray; priority: number } | null = null;
            let nextBestMatchIndex: number | null = null;

            for (const rule of rules) {
                try {
                    const pattern = this.compiledPatterns.get(rule)!;
                    const match = remaining.match(pattern);

                    if (match && match.index !== undefined) {
                        if (match.index === 0) {
                            bestMatch = { rule, match, priority: 1000 };
                            break;
                        }

                        if (nextBestMatchIndex === null || match.index < nextBestMatchIndex) {
                            nextBestMatchIndex = match.index;
                        }

                        const priority = 1000 - match.index;
                        if (!bestMatch || priority > bestMatch.priority ||
                            (priority === bestMatch.priority && match.index < (bestMatch.match.index || 0))) {
                            bestMatch = { rule, match, priority };
                        }
                    }
                } catch (error) {
                    if (this.config.debugMode) {
                        console.warn(`Error in rule "${rule.name}":`, error);
                    }
                }
            }

            if (bestMatch && bestMatch.match.index !== undefined) {
                const { rule, match } = bestMatch;
                const matchIndex = match.index as number;

                if (matchIndex > 0) {
                    const textBefore = remaining.slice(0, matchIndex);
                    tokens.push({ type: 'text', content: textBefore, raw: textBefore });
                    remaining = remaining.slice(matchIndex);
                    continue;
                }

                try {
                    const token = rule.render(match);
                    tokens.push({ ...token, raw: match[0] || '' });
                    remaining = remaining.slice(match[0]?.length || 0);
                } catch (error) {
                    const msg = error instanceof Error ? error.message : String(error);
                    this.warnings.push(`Failed to render ${rule.name}: ${msg}`);
                    const char = remaining[0];
                    if (char) {
                        tokens.push({ type: 'text', content: char, raw: char });
                        remaining = remaining.slice(1);
                    }
                }
            } else {
                const chunkSize = nextBestMatchIndex !== null
                    ? nextBestMatchIndex
                    : Math.min(remaining.length, 1000);
                const textChunk = remaining.slice(0, chunkSize);
                tokens.push({ type: 'text', content: textChunk, raw: textChunk });
                remaining = remaining.slice(chunkSize);
            }
        }

        if (iterationCount >= maxIterations) {
            this.warnings.push('Parser hit maximum iterations - possible infinite loop detected');
        }

        return this.mergeTextTokens(tokens);
    }

    private mergeTextTokens(tokens: MarkdownToken[]): MarkdownToken[] {
        const processed: MarkdownToken[] = [];
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i]!;

            if (token.type === 'text') {
                let textContent = token.content || token.raw || '';
                let j = i + 1;
                while (j < tokens.length && tokens[j]?.type === 'text') {
                    textContent += tokens[j]!.content || tokens[j]!.raw || '';
                    j++;
                }
                if (textContent.trim().length > 0 || textContent.includes('\n')) {
                    processed.push({ type: 'text', content: textContent, raw: textContent });
                }
                i = j;
            } else {
                processed.push(token);
                i++;
            }
        }

        return processed;
    }

    getWarnings(): string[] {
        return [...this.warnings];
    }

    getConfig(): ParserConfig {
        return { ...this.config };
    }

    updateConfig(config: Partial<ParserConfig>): void {
        this.config = { ...this.config, ...config };
    }

    setDebugMode(enabled: boolean): void {
        this.config.debugMode = enabled;
    }

    clearWarnings(): void {
        this.warnings = [];
    }

    private preprocessMarkdown(markdown: string): string {
        if (this.config.validateMarkdown) {
            this.validateMarkdown(markdown);
        }
        return markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    private validateMarkdown(markdown: string): void {
        const boldMatches = markdown.match(/\*\*/g);
        if (boldMatches && boldMatches.length % 2 !== 0) {
            this.warnings.push('Unclosed bold markers (**) detected - some bold formatting may not work');
        }

        const italicMatches = markdown.match(/(?<!\*)\*(?!\*)/g);
        if (italicMatches && italicMatches.length % 2 !== 0) {
            this.warnings.push('Unclosed italic markers (*) detected - some italic formatting may not work');
        }

        const codeBlockMatches = markdown.match(/```/g);
        if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
            this.warnings.push('Unclosed code blocks (```) detected - some code formatting may not work');
        }

        const inlineCodeMatches = markdown.match(/`/g);
        if (inlineCodeMatches && inlineCodeMatches.length % 2 !== 0) {
            this.warnings.push('Unclosed inline code markers (`) detected - some code formatting may not work');
        }
    }
}
