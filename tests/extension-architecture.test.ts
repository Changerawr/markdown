// tests/extension-architecture.test.ts
/**
 * Extension Architecture tests for @changerawr/markdown
 * Tests the extension registration and management system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChangerawrMarkdown } from '../src/engine';
import { MarkdownParser } from '../src/parser';
import { MarkdownRenderer } from '../src/renderer';
import type { Extension } from '../src/types';

describe('Extension Architecture', () => {
    let engine: ChangerawrMarkdown;
    let parser: MarkdownParser;
    let renderer: MarkdownRenderer;

    beforeEach(() => {
        engine = new ChangerawrMarkdown();
        parser = new MarkdownParser();
        renderer = new MarkdownRenderer();
    });

    describe('Extension Registration', () => {
        it('should register extensions successfully', () => {
            const testExtension: Extension = {
                name: 'test',
                parseRules: [{
                    name: 'test-rule',
                    pattern: /\[test\]/g,
                    render: (match) => ({
                        type: 'test',
                        content: 'test content',
                        raw: match[0] || ''
                    })
                }],
                renderRules: [{
                    type: 'test',
                    render: () => '<span>test</span>'
                }]
            };

            const result = engine.registerExtension(testExtension);

            expect(result.success).toBe(true);
            expect(result.extensionName).toBe('test');
            expect(engine.hasExtension('test')).toBe(true);
        });

        it('should handle extension registration errors gracefully', () => {
            const malformedExtension = {
                name: 'malformed',
                parseRules: [{
                    name: 'bad-rule',
                    pattern: null as any, // Intentionally malformed
                    render: () => ({ type: 'bad', content: '', raw: '' })
                }],
                renderRules: []
            };

            const result = engine.registerExtension(malformedExtension as Extension);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(engine.hasExtension('malformed')).toBe(false);
        });

        it('should allow replacing existing extensions', () => {
            const extension1: Extension = {
                name: 'replaceable',
                parseRules: [{
                    name: 'rule1',
                    pattern: /\[old\]/g,
                    render: () => ({ type: 'old', content: 'old', raw: '' })
                }],
                renderRules: [{
                    type: 'old',
                    render: () => '<span>old</span>'
                }]
            };

            const extension2: Extension = {
                name: 'replaceable',
                parseRules: [{
                    name: 'rule2',
                    pattern: /\[new\]/g,
                    render: () => ({ type: 'new', content: 'new', raw: '' })
                }],
                renderRules: [{
                    type: 'new',
                    render: () => '<span>new</span>'
                }]
            };

            engine.registerExtension(extension1);
            engine.registerExtension(extension2);

            const html = engine.toHtml('[new]');
            expect(html).toContain('<span>new</span>');
        });
    });

    describe('Extension Unregistration', () => {
        it('should unregister extensions successfully', () => {
            expect(engine.hasExtension('alert')).toBe(true);

            const success = engine.unregisterExtension('alert');

            expect(success).toBe(true);
            expect(engine.hasExtension('alert')).toBe(false);
        });

        it('should return false for non-existent extensions', () => {
            const success = engine.unregisterExtension('non-existent');
            expect(success).toBe(false);
        });

        it('should rebuild parser and renderer after unregistration', () => {
            const originalExtensions = engine.getExtensions();

            engine.unregisterExtension('button');

            const newExtensions = engine.getExtensions();
            expect(newExtensions).not.toContain('button');
            expect(newExtensions.length).toBe(originalExtensions.length - 1);

            // Should not render buttons anymore
            const html = engine.toHtml('[button:Test](http://test.com)');
            expect(html).not.toContain('bg-blue-600');
            expect(html).toContain('[button:Test](http://test.com)'); // Treated as text
        });
    });

    describe('Extension Priority and Ordering', () => {
        it('should prioritize core extensions', () => {
            const customExtension: Extension = {
                name: 'custom-heading',
                parseRules: [{
                    name: 'custom-heading',
                    pattern: /^# (.+)$/m,
                    render: (match) => ({
                        type: 'custom-heading',
                        content: match[1] || '',
                        raw: match[0] || ''
                    })
                }],
                renderRules: [{
                    type: 'custom-heading',
                    render: (token) => `<h1 class="custom">${token.content}</h1>`
                }]
            };

            engine.registerExtension(customExtension);

            // Core heading extension should take precedence
            const html = engine.toHtml('# Test Heading');
            expect(html).not.toContain('class="custom"');
            expect(html).toContain('text-3xl'); // Core heading styles
        });

        it('should handle extension conflicts gracefully', () => {
            const conflictingExtension: Extension = {
                name: 'conflicting-bold',
                parseRules: [{
                    name: 'conflicting-bold',
                    pattern: /\*\*(.+?)\*\*/g,
                    render: (match) => ({
                        type: 'conflicting-bold',
                        content: match[1] || '',
                        raw: match[0] || ''
                    })
                }],
                renderRules: [{
                    type: 'conflicting-bold',
                    render: (token) => `<strong class="conflicting">${token.content}</strong>`
                }]
            };

            engine.registerExtension(conflictingExtension);

            const html = engine.toHtml('**bold text**');
            // Should work without crashing, using the last registered extension
            expect(html).toContain('<strong');
            expect(html).toContain('bold text');
        });
    });

    describe('Parser Integration', () => {
        it('should add parse rules to parser correctly', () => {
            const testExtension: Extension = {
                name: 'parser-test',
                parseRules: [{
                    name: 'parser-rule',
                    pattern: /\[parse-test\]/g,
                    render: () => ({
                        type: 'parse-test',
                        content: 'parsed',
                        raw: '[parse-test]'
                    })
                }],
                renderRules: []
            };

            parser.addRule(testExtension.parseRules[0]!);

            expect(parser.hasRule('parser-rule')).toBe(true);

            const tokens = parser.parse('Some [parse-test] content');
            const parseTestToken = tokens.find(t => t.type === 'parse-test');
            expect(parseTestToken).toBeDefined();
            expect(parseTestToken?.content).toBe('parsed');
        });

        it('should handle empty parse rules gracefully', () => {
            const emptyExtension: Extension = {
                name: 'empty-parse',
                parseRules: [],
                renderRules: [{
                    type: 'empty',
                    render: () => '<span>empty</span>'
                }]
            };

            const result = engine.registerExtension(emptyExtension);
            expect(result.success).toBe(true);
        });
    });

    describe('Renderer Integration', () => {
        it('should add render rules to renderer correctly', () => {
            const testExtension: Extension = {
                name: 'renderer-test',
                parseRules: [],
                renderRules: [{
                    type: 'render-test',
                    render: (token) => `<div class="rendered">${token.content}</div>`
                }]
            };

            renderer.addRule(testExtension.renderRules[0]!);

            expect(renderer.hasRule('render-test')).toBe(true);

            const tokens = [{ type: 'render-test', content: 'test content', raw: '' }];
            const html = renderer.render(tokens);
            expect(html).toBe('<div class="rendered">test content</div>');
        });

        it('should handle unknown token types gracefully', () => {
            const tokens = [{ type: 'unknown-type', content: 'unknown', raw: 'unknown' }];
            const html = renderer.render(tokens);
            expect(html).toBe('unknown'); // Falls back to escaped content
        });

        it('should handle render rule errors gracefully', () => {
            const errorExtension: Extension = {
                name: 'error-extension',
                parseRules: [{
                    name: 'error-rule',
                    pattern: /\[error\]/g,
                    render: () => ({ type: 'error-type', content: 'error', raw: '[error]' })
                }],
                renderRules: [{
                    type: 'error-type',
                    render: () => {
                        throw new Error('Intentional render error');
                    }
                }]
            };

            engine.registerExtension(errorExtension);

            const html = engine.toHtml('[error]');
            expect(html).toContain('Render Error');

            const warnings = engine.getWarnings();
            expect(warnings.some(w => w.includes('Intentional render error'))).toBe(true);
        });
    });

    describe('Extension Listing and Management', () => {
        it('should list all registered extensions', () => {
            const extensions = engine.getExtensions();

            // Should include default extensions
            expect(extensions).toContain('text');
            expect(extensions).toContain('heading');
            expect(extensions).toContain('alert');
            expect(extensions).toContain('button');
            expect(extensions).toContain('embed');

            expect(extensions.length).toBeGreaterThan(10);
        });

        it('should check extension existence correctly', () => {
            expect(engine.hasExtension('heading')).toBe(true);
            expect(engine.hasExtension('non-existent')).toBe(false);
        });

        it('should maintain extension state across operations', () => {
            const initialCount = engine.getExtensions().length;

            const testExtension: Extension = {
                name: 'state-test',
                parseRules: [],
                renderRules: []
            };

            engine.registerExtension(testExtension);
            expect(engine.getExtensions().length).toBe(initialCount + 1);

            engine.unregisterExtension('state-test');
            expect(engine.getExtensions().length).toBe(initialCount);
        });
    });

    describe('Complex Extension Scenarios', () => {
        it('should handle extensions with multiple parse rules', () => {
            const multiRuleExtension: Extension = {
                name: 'multi-rule',
                parseRules: [
                    {
                        name: 'rule1',
                        pattern: /\[rule1\]/g,
                        render: () => ({ type: 'multi', content: 'rule1', raw: '[rule1]' })
                    },
                    {
                        name: 'rule2',
                        pattern: /\[rule2\]/g,
                        render: () => ({ type: 'multi', content: 'rule2', raw: '[rule2]' })
                    }
                ],
                renderRules: [{
                    type: 'multi',
                    render: (token) => `<span class="multi">${token.content}</span>`
                }]
            };

            engine.registerExtension(multiRuleExtension);

            const html = engine.toHtml('[rule1] and [rule2]');
            expect(html).toContain('<span class="multi">rule1</span>');
            expect(html).toContain('<span class="multi">rule2</span>');
        });

        it('should handle extensions with multiple render rules', () => {
            const multiRenderExtension: Extension = {
                name: 'multi-render',
                parseRules: [{
                    name: 'multi-parse',
                    pattern: /\[multi:(\w+)\]/g,
                    render: (match) => ({
                        type: match[1] || 'default',
                        content: match[1] || 'default',
                        raw: match[0] || ''
                    })
                }],
                renderRules: [
                    {
                        type: 'type1',
                        render: (token) => `<div class="type1">${token.content}</div>`
                    },
                    {
                        type: 'type2',
                        render: (token) => `<div class="type2">${token.content}</div>`
                    }
                ]
            };

            engine.registerExtension(multiRenderExtension);

            const html = engine.toHtml('[multi:type1] [multi:type2]');
            expect(html).toContain('<div class="type1">type1</div>');
            expect(html).toContain('<div class="type2">type2</div>');
        });

        it('should handle nested extension processing', () => {
            const nestedExtension: Extension = {
                name: 'nested',
                parseRules: [{
                    name: 'nested-rule',
                    pattern: /\[nested:([^\]]+)\]/g,
                    render: (match) => ({
                        type: 'nested',
                        content: match[1] || '',
                        raw: match[0] || ''
                    })
                }],
                renderRules: [{
                    type: 'nested',
                    render: (token) => `<div class="nested">${token.content}</div>`
                }]
            };

            engine.registerExtension(nestedExtension);

            // Test with content that contains other markdown
            const html = engine.toHtml('[nested:**bold** content]');
            expect(html).toContain('<div class="nested">');
            expect(html).toContain('**bold** content'); // Bold not processed inside nested
        });
    });

    describe('Extension Error Handling', () => {
        it('should continue processing other extensions when one fails', () => {
            const workingExtension: Extension = {
                name: 'working',
                parseRules: [{
                    name: 'working-rule',
                    pattern: /\[working\]/g,
                    render: () => ({ type: 'working', content: 'works', raw: '[working]' })
                }],
                renderRules: [{
                    type: 'working',
                    render: () => '<span>works</span>'
                }]
            };

            const brokenExtension: Extension = {
                name: 'broken',
                parseRules: [{
                    name: 'broken-rule',
                    pattern: /\[broken\]/g,
                    render: () => {
                        throw new Error('Parse error');
                    }
                }],
                renderRules: []
            };

            engine.registerExtension(workingExtension);
            engine.registerExtension(brokenExtension);

            const html = engine.toHtml('[working] [broken]');
            expect(html).toContain('<span>works</span>');
            expect(html).toContain('[broken]'); // Falls back to text

            const warnings = engine.getWarnings();
            expect(warnings.some(w => w.includes('Parse error'))).toBe(true);
        });

        it('should provide meaningful error messages', () => {
            const extension: Extension = {
                name: 'error-test',
                parseRules: [{
                    name: 'error-rule',
                    pattern: /\[error\]/g,
                    render: () => {
                        throw new Error('Specific error message');
                    }
                }],
                renderRules: []
            };

            engine.registerExtension(extension);
            engine.toHtml('[error]');

            const warnings = engine.getWarnings();
            expect(warnings.some(w =>
                w.includes('error-rule') && w.includes('Specific error message')
            )).toBe(true);
        });
    });

    describe('Extension State Isolation', () => {
        it('should isolate extension state between engine instances', () => {
            const engine1 = new ChangerawrMarkdown();
            const engine2 = new ChangerawrMarkdown();

            const testExtension: Extension = {
                name: 'isolation-test',
                parseRules: [],
                renderRules: []
            };

            engine1.registerExtension(testExtension);

            expect(engine1.hasExtension('isolation-test')).toBe(true);
            expect(engine2.hasExtension('isolation-test')).toBe(false);
        });

        it('should maintain independent extension lists', () => {
            const engine1 = new ChangerawrMarkdown();
            const engine2 = new ChangerawrMarkdown();

            engine1.unregisterExtension('alert');

            expect(engine1.hasExtension('alert')).toBe(false);
            expect(engine2.hasExtension('alert')).toBe(true);
        });
    });
});