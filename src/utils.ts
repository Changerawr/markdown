/**
 * Utility functions for Changerawr Markdown
 */

// Import DOMPurify with SSR safety
let DOMPurify: { sanitize: (html: string, options?: Record<string, unknown>) => string } = {
    sanitize: (html: string) => html
};

if (typeof window !== 'undefined') {
    import('dompurify').then(module => {
        DOMPurify = module.default;
    }).catch(err => {
        console.error('Failed to load DOMPurify', err);
    });
}

// Allowed HTML tags and attributes for sanitization
const ALLOWED_TAGS = [
    // Standard HTML
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'del', 'ins',
    'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead',
    'tbody', 'tr', 'th', 'td', 'div', 'span', 'sup', 'sub', 'hr', 'input',
    // Embeds
    'iframe', 'embed', 'object', 'param', 'video', 'audio', 'source',
    // SVG
    'svg', 'path', 'polyline', 'line', 'circle', 'rect', 'g', 'defs', 'use',
    // Form elements
    'form', 'fieldset', 'legend', 'label', 'select', 'option', 'textarea', 'button'
];

const ALLOWED_ATTR = [
    // Standard attributes
    'href', 'title', 'alt', 'src', 'class', 'id', 'target', 'rel', 'type',
    'checked', 'disabled', 'loading', 'width', 'height', 'style', 'role',
    // Iframe attributes
    'frameborder', 'allowfullscreen', 'allow', 'sandbox', 'scrolling',
    'allowtransparency', 'name', 'seamless', 'srcdoc',
    // Data attributes (for embeds)
    'data-*',
    // SVG attributes
    'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'd', 'points', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
    // Media attributes
    'autoplay', 'controls', 'loop', 'muted', 'preload', 'poster',
    // Form attributes
    'value', 'placeholder', 'required', 'readonly', 'maxlength', 'minlength',
    'max', 'min', 'step', 'pattern', 'autocomplete', 'autofocus'
];

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => map[char] || char);
}

/**
 * Generate URL-friendly ID from text
 */
export function generateId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim();
}

/**
 * Sanitize HTML content using DOMPurify
 */
export function sanitizeHtml(html: string): string {
    try {
        // Skip sanitization for embed content that might be sensitive
        if (html.includes('codepen.io/') || html.includes('youtube.com/embed/')) {
            return html;
        }

        // Use DOMPurify if available
        if (typeof DOMPurify?.sanitize === 'function') {
            const sanitized = DOMPurify.sanitize(html, {
                ALLOWED_TAGS,
                ALLOWED_ATTR,
                ALLOW_DATA_ATTR: true,
                ALLOW_UNKNOWN_PROTOCOLS: false,
                SAFE_FOR_TEMPLATES: false,
                WHOLE_DOCUMENT: false,
                RETURN_DOM: false,
                RETURN_DOM_FRAGMENT: false,
                FORCE_BODY: false,
                SANITIZE_DOM: false,
                SANITIZE_NAMED_PROPS: false,
                FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
                ADD_TAGS: ['iframe', 'embed', 'object', 'param'],
                ADD_ATTR: [
                    'allow', 'allowfullscreen', 'frameborder', 'scrolling',
                    'allowtransparency', 'sandbox', 'loading', 'style',
                    'title', 'name', 'seamless', 'srcdoc'
                ],
                ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
            });

            // If too much content is lost, fall back to basic sanitization
            if (sanitized.length < html.length * 0.7) {
                return basicSanitize(html);
            }

            return sanitized;
        }

        // Fallback to basic sanitization
        return basicSanitize(html);
    } catch (error) {
        console.error('Sanitization failed:', error);
        return basicSanitize(html);
    }
}

/**
 * Basic HTML sanitization - removes dangerous content
 */
export function basicSanitize(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/on\w+\s*=\s*'[^']*'/gi, '')
        .replace(/javascript:/gi, '');
}

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if code is running in Node.js environment
 */
export function isNode(): boolean {
    return typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | number;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout as NodeJS.Timeout);
            func(...args);
        };

        clearTimeout(timeout as NodeJS.Timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };

    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (key in target && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                output[key] = deepMerge(target[key], source[key] as any);
            } else {
                output[key] = source[key] as any;
            }
        } else {
            output[key] = source[key] as any;
        }
    }

    return output;
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Parse options string into key-value object
 */
export function parseOptions(options: string): Record<string, string> {
    const parsed: Record<string, string> = {};
    if (!options) return parsed;

    // Parse options like "height:400,theme:dark,autoplay:1"
    options.split(',').forEach(option => {
        const [key, value] = option.split(':').map(s => s.trim());
        if (key && value) {
            parsed[key] = value;
        }
    });

    return parsed;
}

/**
 * Performance measurement utility
 */
export class PerformanceTimer {
    private startTime: number;
    private marks: Record<string, number> = {};

    constructor() {
        this.startTime = performance.now();
    }

    mark(name: string): void {
        this.marks[name] = performance.now() - this.startTime;
    }

    getTime(name?: string): number {
        if (name && this.marks[name] !== undefined) {
            return this.marks[name];
        }
        return performance.now() - this.startTime;
    }

    getAllMarks(): Record<string, number> {
        return { ...this.marks };
    }
}

/**
 * Simple logger with different levels
 */
export class Logger {
    private debugMode: boolean;

    constructor(debugMode = false) {
        this.debugMode = debugMode;
    }

    debug(...args: any[]): void {
        if (this.debugMode) {
            console.log('[DEBUG]', ...args);
        }
    }

    info(...args: any[]): void {
        console.info('[INFO]', ...args);
    }

    warn(...args: any[]): void {
        console.warn('[WARN]', ...args);
    }

    error(...args: any[]): void {
        console.error('[ERROR]', ...args);
    }

    setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }
}