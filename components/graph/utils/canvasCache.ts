/**
 * Cache for pre-rendered canvas elements (e.g., labels)
 */
class CanvasCache {
  private cache = new Map<string, HTMLCanvasElement>()
  private maxSize = 100 // Limit cache size to prevent memory leaks

  /**
   * Get a cached canvas or create if not exists
   */
  get(key: string, creator: () => HTMLCanvasElement): HTMLCanvasElement {
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    const canvas = creator()
    this.set(key, canvas)
    return canvas
  }

  /**
   * Set a cache entry
   */
  set(key: string, canvas: HTMLCanvasElement): void {
    // Implement LRU-style eviction if cache is too large
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, canvas)
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Remove a specific entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size
  }
}

// Singleton instance
export const canvasCache = new CanvasCache()

/**
 * Pre-render text to an offscreen canvas
 */
export function createCachedLabel(
  text: string,
  fontSize: number,
  fontFamily = 'Inter, system-ui, sans-serif',
  color = '#000000'
): HTMLCanvasElement {
  const key = `${text}-${fontSize}-${fontFamily}-${color}`

  return canvasCache.get(key, () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    ctx.font = `${fontSize}px ${fontFamily}`
    const metrics = ctx.measureText(text)

    // Set canvas size with padding
    canvas.width = Math.ceil(metrics.width) + 4
    canvas.height = Math.ceil(fontSize * 1.5)

    // Re-apply font after resizing canvas
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    return canvas
  })
}
