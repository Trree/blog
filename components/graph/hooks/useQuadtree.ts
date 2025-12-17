import { useMemo } from 'react'
import * as d3 from 'd3'
import type { D3Node, Rect } from '../types'

export interface QuadtreeHelpers {
  findNode: (x: number, y: number, radius?: number) => D3Node | undefined
  findNodesInRect: (rect: Rect) => D3Node[]
  quadtree: d3.Quadtree<D3Node>
}

/**
 * Hook to create and manage a D3 quadtree for spatial indexing
 * Provides O(log n) node lookups instead of O(n)
 */
export function useQuadtree(nodes: D3Node[]): QuadtreeHelpers {
  const quadtree = useMemo(() => {
    return d3
      .quadtree<D3Node>()
      .x((d) => d.x ?? 0)
      .y((d) => d.y ?? 0)
      .addAll(nodes.filter((n) => n.x != null && n.y != null))
  }, [nodes])

  const findNode = useMemo(
    () => (x: number, y: number, radius = 15) => {
      return quadtree.find(x, y, radius)
    },
    [quadtree]
  )

  const findNodesInRect = useMemo(
    () => (rect: Rect) => {
      const foundNodes: D3Node[] = []

      quadtree.visit((node, x1, y1, x2, y2) => {
        // Check if quadtree node overlaps with rect
        if (x1 > rect.x + rect.width || x2 < rect.x || y1 > rect.y + rect.height || y2 < rect.y) {
          return true // Skip this quadtree node
        }

        // Check if leaf node contains data
        if (!('length' in node)) {
          const data = node.data
          if (
            data &&
            data.x != null &&
            data.y != null &&
            data.x >= rect.x &&
            data.x <= rect.x + rect.width &&
            data.y >= rect.y &&
            data.y <= rect.y + rect.height
          ) {
            foundNodes.push(data)
          }
        }

        return false // Continue visiting
      })

      return foundNodes
    },
    [quadtree]
  )

  return {
    findNode,
    findNodesInRect,
    quadtree,
  }
}
