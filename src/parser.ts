import type { MarkdownToken, ParseRule, ParserConfig } from './types';

export class MarkdownParser {
    private rules: ParseRule[] = [];
    private warnings: string[] = [];
    private config: ParserConfig;

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
        // Sort by priority - extensions should define their own priority
        this.rules.sort((a, b) => {
            // Feature extensions first (alert, button, embed) - they have more specific patterns
            const aFeatureExtension = ['alert', 'button', 'embed'].includes(a.name);
            const bFeatureExtension = ['alert', 'button', 'embed'].includes(b.name);

            if (aFeatureExtension && !bFeatureExtension) return -1;
            if (!aFeatureExtension && bFeatureExtension) return 1;

            // Core extensions next
            const aCoreExtension = ['text', 'heading', 'bold', 'italic', 'code', 'codeblock', 'link', 'image', 'list', 'task-list', 'blockquote', 'hr', 'paragraph', 'line-break'].includes(a.name);
            const bCoreExtension = ['text', 'heading', 'bold', 'italic', 'code', 'codeblock', 'link', 'image', 'list', 'task-list', 'blockquote', 'hr', 'paragraph', 'line-break'].includes(b.name);

            if (aCoreExtension && !bCoreExtension) return -1;
            if (!aCoreExtension && bCoreExtension) return 1;

            // Within same category, specific ordering
            // Images before links (more specific pattern)
            if (a.name === 'image' && b.name === 'link') return -1;
            if (a.name === 'link' && b.name === 'image') return 1;

            // Task lists before regular lists
            if (a.name === 'task-item' && b.name === 'list-item') return -1;
            if (a.name === 'list-item' && b.name === 'task-item') return 1;

            // Code blocks before inline code
            if (a.name === 'codeblock' && b.name === 'code') return -1;
            if (a.name === 'code' && b.name === 'codeblock') return 1;

            // Bold before italic
            if (a.name === 'bold' && b.name === 'italic') return -1;
            if (a.name === 'italic' && b.name === 'bold') return 1;

            // Then alphabetical
            return a.name.localeCompare(b.name);
        });
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

            // Try each rule and find the best match (earliest position)
            for (const rule of this.rules) {
                try {
                    // Create a fresh regex without global flag for position-based matching
                    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', ''));
                    const match = remaining.match(pattern);

                    if (match && match.index !== undefined) {
                        // Prioritize matches at position 0, but also consider nearby matches
                        const priority = match.index === 0 ? 1000 : (1000 - match.index);

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
                    tokens.push({
                        ...token,
                        raw: match[0] || ''
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
                // Take one character and continue
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
                processed.push(token);
                i++;
            } else {
                i++;
            }
        }

        return processed;
    }
}