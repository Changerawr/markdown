import type { MarkdownToken, ParseRule, ParserConfig } from './types';

export class MarkdownParser {
    private rules: ParseRule[] = [];
    private warnings: string[] = [];
    private config: ParserConfig;
    private compiledPatterns = new Map<ParseRule, RegExp>(); // Cache compiled regexes
    private recursiveContentTypes = new Map<string, boolean>(); // Track which token types need recursive parsing

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
        // Pre-compile the regex pattern (without global flag for position-based matching)
        this.compiledPatterns.set(
            rule,
            new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', ''))
        );
        // Track if this rule needs recursive content parsing
        if (rule.recursiveContent) {
            this.recursiveContentTypes.set(rule.name, true);
        }
        // Sort by priority - use explicit priority if provided, otherwise calculate automatically
        this.rules.sort((a, b) => {
            // Use explicit priority if set, otherwise calculate from pattern
            const aPriority = a.priority !== undefined ? a.priority : this.calculatePatternPriority(a);
            const bPriority = b.priority !== undefined ? b.priority : this.calculatePatternPriority(b);

            // Higher priority goes first
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }

            // If same priority, alphabetical for consistency
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Calculate pattern priority automatically based on pattern complexity
     * Higher priority = more specific pattern = processed first
     *
     * Algorithm analyzes:
     * - Pattern length and specificity
     * - Multi-line vs single-line
     * - Literal character sequences
     * - Anchors and boundaries
     * - Repetition specificity
     */
    private calculatePatternPriority(rule: ParseRule): number {
        const pattern = rule.pattern.source;
        let score = 100; // Base score

        // 1. Multi-line patterns get higher priority (more specific context)
        const isMultiLine = /\\n|[\s\S]/.test(pattern);
        if (isMultiLine) {
            score += 500;
        }

        // 2. Count literal character sequences (non-regex chars)
        // More literals = more specific pattern
        const literalChars = pattern.replace(/\\[^a-zA-Z0-9]|[\[\](){}|^$.*+?]/g, '');
        score += literalChars.length * 10;

        // 3. Consecutive literal sequences (e.g., ":::", "```", "==")
        const consecutiveLiterals = pattern.match(/[a-zA-Z0-9:=`!@#$%&_-]{2,}/g) || [];
        score += consecutiveLiterals.reduce((sum, seq) => sum + (seq.length * 20), 0);

        // 4. Anchors increase specificity
        if (pattern.startsWith('^')) score += 100; // Start anchor
        if (pattern.endsWith('$')) score += 100; // End anchor

        // 5. Word boundaries increase specificity
        const boundaryCount = (pattern.match(/\\b/g) || []).length;
        score += boundaryCount * 30;

        // 6. Specific quantifiers are better than greedy wildcards
        const greedyWildcards = (pattern.match(/\.\*|\.\+/g) || []).length;
        score -= greedyWildcards * 50; // Penalty for greedy matching

        // 7. Character classes with negation are more specific
        const negatedClasses = (pattern.match(/\[\^[^\]]+\]/g) || []).length;
        score += negatedClasses * 40;

        // 8. Lookaheads/lookbehinds are very specific
        const lookarounds = (pattern.match(/\(\?[=!<]/g) || []).length;
        score += lookarounds * 100;

        // 9. Fallback patterns (very generic) get lowest priority
        if (rule.name === 'text' || rule.name === 'paragraph' || rule.name === 'line-break') {
            score = 10; // Override to very low
        }

        return Math.max(0, score); // Ensure non-negative
    }

    hasRule(name: string): boolean {
        return this.rules.some(rule => rule.name === name);
    }

    parse(markdown: string): MarkdownToken[] {
        // Clear previous warnings
        this.warnings = [];

        if (!markdown.trim()) {
            return [];
        }

        // Check if we have any rules at all
        if (this.rules.length === 0) {
            this.warnings.push('No parse rules registered - consider using CoreExtensions');
            return [{
                type: 'text',
                content: markdown,
                raw: markdown
            }];
        }

        // Pre-process markdown to handle common issues
        const processedMarkdown = this.preprocessMarkdown(markdown);

        const tokens: MarkdownToken[] = [];
        let remaining = processedMarkdown;
        let iterationCount = 0;
        const maxIterations = this.config.maxIterations || 10000;

        while (remaining.length > 0 && iterationCount < maxIterations) {
            iterationCount++;
            let matched = false;
            let bestMatch: { rule: ParseRule; match: RegExpMatchArray; priority: number } | null = null;
            let nextBestMatchIndex: number | null = null;

            // Try each rule and find the best match (earliest position)
            for (const rule of this.rules) {
                try {
                    // Use pre-compiled regex pattern
                    const pattern = this.compiledPatterns.get(rule)!;
                    const match = remaining.match(pattern);

                    if (match && match.index !== undefined) {
                        // If we found a match at position 0, use it immediately (common case)
                        if (match.index === 0) {
                            bestMatch = { rule, match, priority: 1000 };
                            break; // Early exit - can't get better than position 0
                        }

                        // Track the closest match for chunking optimization
                        if (nextBestMatchIndex === null || match.index < nextBestMatchIndex) {
                            nextBestMatchIndex = match.index;
                        }

                        // Otherwise, consider nearby matches
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

                // If match is not at the beginning, take text before it
                if (matchIndex > 0) {
                    const textBefore = remaining.slice(0, matchIndex);
                    tokens.push({
                        type: 'text',
                        content: textBefore,
                        raw: textBefore
                    });
                    remaining = remaining.slice(matchIndex);
                    continue;
                }

                // Process the match
                try {
                    const token = rule.render(match);
                    // Mark token if it needs recursive parsing
                    const needsRecursiveParsing = rule.recursiveContent || false;
                    tokens.push({
                        ...token,
                        raw: match[0] || '',
                        attributes: {
                            ...token.attributes,
                            _recursiveContent: needsRecursiveParsing
                        }
                    });

                    remaining = remaining.slice(match[0]?.length || 0);
                    matched = true;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.warnings.push(`Failed to render ${rule.name}: ${errorMessage}`);

                    // Fall back to treating as text
                    const char = remaining[0];
                    if (char) {
                        tokens.push({
                            type: 'text',
                            content: char,
                            raw: char
                        });
                        remaining = remaining.slice(1);
                    }
                }
            }

            if (!matched) {
                // Use the next match index we already found during the search
                // This avoids a second expensive search through all rules
                const chunkSize = nextBestMatchIndex !== null
                    ? nextBestMatchIndex
                    : Math.min(remaining.length, 1000); // Take up to 1000 chars of plain text

                const textChunk = remaining.slice(0, chunkSize);

                tokens.push({
                    type: 'text',
                    content: textChunk,
                    raw: textChunk
                });
                remaining = remaining.slice(chunkSize);
            }
        }

        if (iterationCount >= maxIterations) {
            this.warnings.push('Parser hit maximum iterations - possible infinite loop detected');
        }

        // Post-process tokens to merge consecutive text and validate structure
        const processedTokens = this.postProcessTokens(tokens);

        return processedTokens;
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
        // Check for common markdown issues and warn about them
        if (this.config.validateMarkdown) {
            this.validateMarkdown(markdown);
        }

        // Normalize line endings
        return markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    private validateMarkdown(markdown: string): void {
        // Check for unclosed bold markers
        const boldMatches = markdown.match(/\*\*/g);
        if (boldMatches && boldMatches.length % 2 !== 0) {
            this.warnings.push('Unclosed bold markers (**) detected - some bold formatting may not work');
        }

        // Check for unclosed italic markers
        const italicMatches = markdown.match(/(?<!\*)\*(?!\*)/g);
        if (italicMatches && italicMatches.length % 2 !== 0) {
            this.warnings.push('Unclosed italic markers (*) detected - some italic formatting may not work');
        }

        // Check for unclosed code blocks
        const codeBlockMatches = markdown.match(/```/g);
        if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
            this.warnings.push('Unclosed code blocks (```) detected - some code formatting may not work');
        }

        // Check for unclosed inline code
        const inlineCodeMatches = markdown.match(/`/g);
        if (inlineCodeMatches && inlineCodeMatches.length % 2 !== 0) {
            this.warnings.push('Unclosed inline code markers (`) detected - some code formatting may not work');
        }
    }

    private postProcessTokens(tokens: MarkdownToken[]): MarkdownToken[] {
        const processed: MarkdownToken[] = [];
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i];

            if (token && token.type === 'text') {
                // Collect consecutive text tokens
                let textContent = token.content || token.raw || '';
                let j = i + 1;

                while (j < tokens.length && tokens[j] && tokens[j]!.type === 'text') {
                    const nextToken = tokens[j]!;
                    textContent += nextToken.content || nextToken.raw || '';
                    j++;
                }

                // Only create a text token if there's actual content
                if (textContent.trim().length > 0 || textContent.includes('\n')) {
                    processed.push({
                        type: 'text',
                        content: textContent,
                        raw: textContent
                    });
                }

                i = j;
            } else if (token) {
                // Recursively parse content for block-level elements
                const processedToken = this.recursivelyParseBlockContent(token);
                processed.push(processedToken);
                i++;
            } else {
                i++;
            }
        }

        return processed;
    }

    private recursivelyParseBlockContent(token: MarkdownToken): MarkdownToken {
        // Check if this token type should have its content recursively parsed
        // This can be set via the recursiveContent flag on the parse rule, or hardcoded for core types
        const coreBlockTypes = ['alert', 'blockquote', 'list-item', 'ordered-list-item', 'task-item'];
        const needsRecursiveParsing = token.attributes?._recursiveContent === true || coreBlockTypes.includes(token.type);

        if (needsRecursiveParsing && token.content && token.content.trim()) {
            // Recursively parse the content into child tokens
            // For list-items and task-items, we need to exclude list rules to prevent
            // dashes in inline content (like "**bold** - text") from being treated as nested list items
            let children: MarkdownToken[];

            if ((token.type === 'list-item' || token.type === 'ordered-list-item' || token.type === 'task-item') && this.rules.some(r => r.name === 'unordered-list-item' || r.name === 'ordered-list-item' || r.name === 'task-item')) {
                // Create a parser with the list-item rule excluded
                const parserWithoutListRule = new MarkdownParser(this.config);
                this.rules.forEach(rule => {
                    // Skip list-item rules when parsing inside list items
                    if (rule.name !== 'unordered-list-item' && rule.name !== 'ordered-list-item' && rule.name !== 'task-item') {
                        parserWithoutListRule.addRule(rule);
                    }
                });
                children = parserWithoutListRule.parse(token.content);
            } else {
                children = this.parse(token.content);
            }

            return {
                ...token,
                children
            };
        }

        return token;
    }
}