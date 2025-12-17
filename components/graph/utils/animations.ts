export interface EasingFunction {
  (t: number): number
}

/**
 * Easing functions for animations
 */
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
}

export interface AnimationOptions {
  from: number
  to: number
  duration: number
  easing?: keyof typeof easings
  onUpdate: (value: number) => void
  onComplete?: () => void
}

/**
 * Animate a value from start to end
 */
export function animate(options: AnimationOptions): () => void {
  const { from, to, duration, easing = 'easeOutCubic', onUpdate, onComplete } = options

  const startTime = performance.now()
  const easingFn = easings[easing]
  let rafId: number

  const tick = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFn(progress)
    const value = from + (to - from) * easedProgress

    onUpdate(value)

    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    } else if (onComplete) {
      onComplete()
    }
  }

  rafId = requestAnimationFrame(tick)

  // Return cancel function
  return () => cancelAnimationFrame(rafId)
}

/**
 * Staggered animation for multiple items
 */
export function staggeredAnimate(
  items: any[],
  staggerDelay: number,
  itemAnimationFn: (item: any, index: number) => void
): () => void {
  const timeouts: NodeJS.Timeout[] = []

  items.forEach((item, index) => {
    const timeout = setTimeout(() => {
      itemAnimationFn(item, index)
    }, index * staggerDelay)

    timeouts.push(timeout)
  })

  // Return cancel function
  return () => {
    timeouts.forEach((timeout) => clearTimeout(timeout))
  }
}
