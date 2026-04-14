import React from 'react';
import type { MarkdownToken } from '../types';
import type { ReactComponentRenderRule } from './types';

interface TokenTreeRendererProps {
    tokens: MarkdownToken[];
    /**
     * Map from token type → the rule that carries a React component.
     * Only rules that actually have a `component` field should be in this map.
     */
    componentMap: Map<string, ReactComponentRenderRule>;
    /**
     * Renders a batch of tokens to an HTML string using the engine.
     * Used for all tokens that don't have a React component attached.
     */
    renderBatch: (tokens: MarkdownToken[]) => string;
}

/**
 * TokenTreeRenderer — walks a token array and renders each token as either:
 *   • A React component (when the token type has a `component` registered)
 *   • A raw HTML chunk via `dangerouslySetInnerHTML` (everything else)
 *
 * Consecutive non-component tokens are batched into a single HTML chunk so that
 * list-grouping and other renderer logic (which operates on slices) still works.
 *
 * ⚠ Limitation: list items must not be interleaved with component tokens —
 * the list-grouping in MarkdownRenderer operates on contiguous slices.
 */
export function TokenTreeRenderer({
    tokens,
    componentMap,
    renderBatch
}: TokenTreeRendererProps): React.ReactElement {
    const elements: React.ReactNode[] = [];
    let htmlBuffer: MarkdownToken[] = [];
    let keyCounter = 0;

    const flushBuffer = () => {
        if (htmlBuffer.length === 0) return;
        const html = renderBatch(htmlBuffer);
        elements.push(
            <div
                key={`html-${keyCounter++}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
        htmlBuffer = [];
    };

    for (const token of tokens) {
        const rule = componentMap.get(token.type);

        if (rule?.component) {
            flushBuffer();
            const Component = rule.component;

            // Recursively render children as React elements when present
            const childElements =
                token.children && token.children.length > 0 ? (
                    <TokenTreeRenderer
                        tokens={token.children}
                        componentMap={componentMap}
                        renderBatch={renderBatch}
                    />
                ) : undefined;

            elements.push(
                <Component key={`comp-${keyCounter++}`} token={token}>
                    {childElements}
                </Component>
            );
        } else {
            htmlBuffer.push(token);
        }
    }

    flushBuffer();

    return <>{elements}</>;
}
