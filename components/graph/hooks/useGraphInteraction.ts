import { useState, useCallback } from 'react'
import type { D3Node } from '../types'

export interface InteractionState {
  selectedNodes: Set<string>
  hoveredNode: D3Node | null
  draggedNode: D3Node | null
}

export interface InteractionHandlers {
  state: InteractionState
  setHoveredNode: (node: D3Node | null) => void
  selectNode: (node: D3Node, multi?: boolean) => void
  deselectAll: () => void
  setDraggedNode: (node: D3Node | null) => void
  toggleNodeSelection: (nodeId: string) => void
  isNodeSelected: (nodeId: string) => boolean
}

/**
 * Hook to manage graph interaction state
 */
export function useGraphInteraction(): InteractionHandlers {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  const [hoveredNode, setHoveredNode] = useState<D3Node | null>(null)
  const [draggedNode, setDraggedNode] = useState<D3Node | null>(null)

  const selectNode = useCallback((node: D3Node, multi = false) => {
    setSelectedNodes((prev) => {
      if (multi) {
        const newSet = new Set(prev)
        if (newSet.has(node.id)) {
          newSet.delete(node.id)
        } else {
          newSet.add(node.id)
        }
        return newSet
      }
      return new Set([node.id])
    })
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedNodes(new Set())
  }, [])

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }, [])

  const isNodeSelected = useCallback(
    (nodeId: string) => {
      return selectedNodes.has(nodeId)
    },
    [selectedNodes]
  )

  return {
    state: {
      selectedNodes,
      hoveredNode,
      draggedNode,
    },
    setHoveredNode,
    selectNode,
    deselectAll,
    setDraggedNode,
    toggleNodeSelection,
    isNodeSelected,
  }
}
