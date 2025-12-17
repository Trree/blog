import type * as d3 from 'd3'
import type { D3Node } from '../types'
import { getNodeRadius } from './nodeRenderer'

export interface LabelRendererOptions {
  isDark: boolean
  transform: d3.ZoomTransform
  hoveredNodeId: string | null
  selectedNodeIds: Set<string>
  minZoomForLabels?: number
  minNodesForLabelHiding?: number
}

/**
 * Render labels to canvas
 */
export function renderLabels(
  ctx: CanvasRenderingContext2D,
  nodes: D3Node[],
  options: LabelRendererOptions
): void {
  const {
    isDark,
    transform,
    hoveredNodeId,
    selectedNodeIds,
    minZoomForLabels = 0.5,
    minNodesForLabelHiding = 50,
  } = options

  // Skip labels if zoomed out too far (performance optimization)
  if (transform.k < minZoomForLabels && nodes.length > minNodesForLabelHiding) {
    return
  }

  ctx.save()

  const labelColor = isDark ? '#CBD5E1' : '#475569'
  const highlightLabelColor = isDark ? '#F8FAFC' : '#0F172A'
  const bgColor = isDark ? 'rgba(2, 6, 23, 0.82)' : 'rgba(255, 255, 255, 0.9)'

  nodes.forEach((node) => {
    if (!node.x || !node.y || !node.visible) return

    const alpha = node.alpha ?? 1
    if (alpha <= 0) return

    const radius = node.renderRadius ?? getNodeRadius(node)
    const isHovered = hoveredNodeId === node.id
    const isSelected = selectedNodeIds.has(node.id)

    // Only show label for hovered/selected nodes, or all if zoomed in enough
    const showLabel = transform.k >= minZoomForLabels || isHovered || isSelected

    if (!showLabel) return

    const fontSize = (isHovered || isSelected ? 11 : 9) / transform.k
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.globalAlpha = alpha * (node.opacity ?? 1)

    // Draw background for selected/hovered labels
    if (isHovered || isSelected) {
      const textMetrics = ctx.measureText(node.label)
      const textWidth = textMetrics.width
      const textHeight = fontSize * 1.2

      ctx.fillStyle = bgColor
      ctx.fillRect(
        node.x - textWidth / 2 - 2,
        node.y + radius + 4 - textHeight / 2,
        textWidth + 4,
        textHeight
      )
    }

    // Draw text
    ctx.fillStyle = isHovered || isSelected ? highlightLabelColor : labelColor
    ctx.fillText(node.label, node.x, node.y + radius + fontSize)
  })

  ctx.globalAlpha = 1
  ctx.restore()
}
