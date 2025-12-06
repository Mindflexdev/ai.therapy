/**
 * Simple in-memory cache for Supabase queries
 * Implements stale-while-revalidate pattern
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    promise?: Promise<T>;
}

class QueryCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Get cached data or fetch if not available
     * Implements stale-while-revalidate
     */
    async get<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = this.defaultTTL
    ): Promise<T> {
        const cached = this.cache.get(key);
        const now = Date.now();

        // Return cached data if fresh
        if (cached && now - cached.timestamp < ttl) {
            return cached.data;
        }

        // If we have stale data and a fetch is in progress, return stale data
        if (cached?.promise) {
            return cached.data;
        }

        // Start fetching
        const promise = fetcher();

        // Store promise to prevent duplicate requests
        if (cached) {
            cached.promise = promise;
        } else {
            this.cache.set(key, {
                data: null as any,
                timestamp: 0,
                promise,
            });
        }

        try {
            const data = await promise;
            this.cache.set(key, {
                data,
                timestamp: now,
            });
            return data;
        } catch (error) {
            // If fetch fails and we have stale data, return it
            if (cached?.data) {
                return cached.data;
            }
            throw error;
        }
    }

    /**
     * Invalidate cache entry
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all cache entries matching pattern
     */
    invalidatePattern(pattern: RegExp): void {
        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Prefetch data
     */
    async prefetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl?: number
    ): Promise<void> {
        await this.get(key, fetcher, ttl);
    }
}

export const queryCache = new QueryCache();

/**
 * Helper to create cache keys
 */
export const createCacheKey = (table: string, params?: Record<string, any>): string => {
    if (!params) return table;
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');
    return `${table}:${sortedParams}`;
};
