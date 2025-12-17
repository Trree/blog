import type * as d3 from 'd3'
import type { Point } from '../types'

/**
 * Convert screen coordinates to graph coordinates
 */
export function screenToGraph(
  screenX: number,
  screenY: number,
  transform: d3.ZoomTransform
): Point {
  return {
    x: (screenX - transform.x) / transform.k,
    y: (screenY - transform.y) / transform.k,
  }
}

/**
 * Convert graph coordinates to screen coordinates
 */
export function graphToScreen(
  graphX: number,
  graphY: number,
  transform: d3.ZoomTransform
): Point {
  return {
    x: graphX * transform.k + transform.x,
    y: graphY * transform.k + transform.y,
  }
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Check if a point is inside a circle
 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  return distance(point, center) <= radius
}

/**
 * Check if a point is inside a rectangle
 */
export function isPointInRect(
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}
