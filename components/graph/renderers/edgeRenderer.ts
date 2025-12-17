import type * as d3 from 'd3'
import type { D3Node, D3Link } from '../types'

export interface EdgeRendererOptions {
  isDark: boolean
  transform: d3.ZoomTransform
  curvedEdges?: boolean
  gradientEdges?: boolean
}

/**
 * Render edges to canvas
 */
export function renderEdges(
  ctx: CanvasRenderingContext2D,
  links: D3Link[],
  options: EdgeRendererOptions
): void {
  const { isDark, transform, curvedEdges = true, gradientEdges = true } = options

  ctx.save()

  const baseEdgeOpacity = isDark ? 0.3 : 0.2
  ctx.lineWidth = 0.3 / transform.k

  links.forEach((link) => {
    const source = link.source as D3Node
    const target = link.target as D3Node

    if (!source.x || !source.y || !target.x || !target.y) return
    if (!source.visible || !target.visible) return

    // Apply gradient if enabled and nodes have colors
    if (gradientEdges && source.color && target.color) {
      const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y)
      gradient.addColorStop(0, isDark ? source.color.dark : source.color.light)
      gradient.addColorStop(1, isDark ? target.color.dark : target.color.light)
      ctx.strokeStyle = `${gradient}`
      // Add opacity manually since gradients don't support it directly
      ctx.globalAlpha = baseEdgeOpacity * 0.6
    } else {
      ctx.strokeStyle = isDark ? `rgba(148, 163, 184, ${baseEdgeOpacity})` : `rgba(148, 163, 184, ${baseEdgeOpacity})`
      ctx.globalAlpha = 1
    }

    ctx.beginPath()

    if (curvedEdges) {
      drawCurvedEdge(ctx, source, target)
    } else {
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)
    }

    ctx.stroke()
  })

  ctx.globalAlpha = 1
  ctx.restore()
}

/**
 * Draw a curved bezier edge between two nodes
 */
function drawCurvedEdge(
  ctx: CanvasRenderingContext2D,
  source: D3Node,
  target: D3Node
): void {
  if (!source.x || !source.y || !target.x || !target.y) return

  const dx = target.x - source.x
  const dy = target.y - source.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Only curve if nodes are not too close
  if (dist < 50) {
    ctx.moveTo(source.x, source.y)
    ctx.lineTo(target.x, target.y)
    return
  }

  // Calculate control point for quadratic curve
  const curvature = 0.15
  const midX = (source.x + target.x) / 2
  const midY = (source.y + target.y) / 2

  // Perpendicular offset
  const offset = dist * curvature
  const cpX = midX - (dy / dist) * offset
  const cpY = midY + (dx / dist) * offset

  ctx.moveTo(source.x, source.y)
  ctx.quadraticCurveTo(cpX, cpY, target.x, target.y)
}
