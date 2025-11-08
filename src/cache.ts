/**
 * LRU (Least Recently Used) Cache implementation for markdown rendering
 * Provides efficient caching with automatic eviction of old entries
 */

export interface CacheEntry<V> {
    value: V;
    timestamp: number;
    accessCount: number;
}

export interface CacheStats {
    size: number;
    capacity: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
}

export class LRUCache<K, V> {
    private cache = new Map<K, CacheEntry<V>>();
    private capacity: number;
    private hits = 0;
    private misses = 0;
    private evictions = 0;

    constructor(capacity = 100) {
        if (capacity <= 0) {
            throw new Error('Cache capacity must be greater than 0');
        }
        this.capacity = capacity;
    }

    /**
     * Get a value from the cache
     */
    get(key: K): V | undefined {
        const entry = this.cache.get(key);

        if (entry) {
            // Update access metadata
            entry.timestamp = Date.now();
            entry.accessCount++;
            this.hits++;

            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, entry);

            return entry.value;
        }

        this.misses++;
        return undefined;
    }

    /**
     * Set a value in the cache
     */
    set(key: K, value: V): void {
        // If key already exists, update it
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // If at capacity, evict least recently used
        else if (this.cache.size >= this.capacity) {
            this.evictLRU();
        }

        // Add new entry at end (most recently used)
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            accessCount: 0
        });
    }

    /**
     * Check if a key exists in the cache
     */
    has(key: K): boolean {
        return this.cache.has(key);
    }

    /**
     * Delete a specific key from the cache
     */
    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all entries from the cache
     */
    clear(): void {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
    }

    /**
     * Get the current size of the cache
     */
    get size(): number {
        return this.cache.size;
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        const totalRequests = this.hits + this.misses;
        return {
            size: this.cache.size,
            capacity: this.capacity,
            hits: this.hits,
            misses: this.misses,
            hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
            evictions: this.evictions
        };
    }

    /**
     * Reset cache statistics
     */
    resetStats(): void {
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
    }

    /**
     * Get all keys in the cache
     */
    keys(): K[] {
        return Array.from(this.cache.keys());
    }

    /**
     * Get all values in the cache
     */
    values(): V[] {
        return Array.from(this.cache.values()).map(entry => entry.value);
    }

    /**
     * Update cache capacity and evict if necessary
     */
    setCapacity(newCapacity: number): void {
        if (newCapacity <= 0) {
            throw new Error('Cache capacity must be greater than 0');
        }

        this.capacity = newCapacity;

        // Evict entries if new capacity is smaller than current size
        while (this.cache.size > this.capacity) {
            this.evictLRU();
        }
    }

    /**
     * Evict the least recently used entry
     */
    private evictLRU(): void {
        // Map preserves insertion order, first entry is least recently used
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) {
            this.cache.delete(firstKey);
            this.evictions++;
        }
    }
}

/**
 * Simple hash function for content
 * Uses FNV-1a algorithm for fast, decent-quality hashing
 */
export function hashContent(content: string): string {
    // For very large content, sample instead of hashing every character
    if (content.length > 10000) {
        // Sample: hash length + first 1000 + middle 1000 + last 1000 chars
        const start = content.slice(0, 1000);
        const middle = content.slice(Math.floor(content.length / 2) - 500, Math.floor(content.length / 2) + 500);
        const end = content.slice(-1000);
        const sample = content.length + '|' + start + middle + end;

        let hash = 2166136261;
        for (let i = 0; i < sample.length; i++) {
            hash ^= sample.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        return (hash >>> 0).toString(36);
    }

    // For smaller content, hash normally
    let hash = 2166136261; // FNV offset basis
    for (let i = 0; i < content.length; i++) {
        hash ^= content.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    return (hash >>> 0).toString(36);
}

/**
 * Create a cached version of a function
 */
export function memoize<T extends (...args: any[]) => any>(
    fn: T,
    options: {
        cache?: LRUCache<string, ReturnType<T>>;
        keyGenerator?: (...args: Parameters<T>) => string;
        maxSize?: number;
    } = {}
): T & { cache: LRUCache<string, ReturnType<T>>; clearCache: () => void } {
    const cache = options.cache || new LRUCache<string, ReturnType<T>>(options.maxSize || 100);
    const keyGenerator = options.keyGenerator || ((...args: Parameters<T>) => JSON.stringify(args));

    const memoized = function(this: any, ...args: Parameters<T>): ReturnType<T> {
        const key = keyGenerator(...args);
        const cached = cache.get(key);

        if (cached !== undefined) {
            return cached;
        }

        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    } as T & { cache: LRUCache<string, ReturnType<T>>; clearCache: () => void };

    memoized.cache = cache;
    memoized.clearCache = () => cache.clear();

    return memoized;
}
