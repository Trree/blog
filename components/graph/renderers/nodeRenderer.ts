import type * as d3 from 'd3'
import type { D3Node } from '../types'

export interface NodeRendererOptions {
  isDark: boolean
  transform: d3.ZoomTransform
  hoveredNodeId: string | null
  selectedNodeIds: Set<string>
  useGradients?: boolean
  useShadows?: boolean
}

/**
 * Calculate node radius based on connections
 */
export function getNodeRadius(node: D3Node): number {
  return Math.min(15, 4 + node.connections * 0.8)
}

/**
 * Render nodes to canvas
 */
export function renderNodes(
  ctx: CanvasRenderingContext2D,
  nodes: D3Node[],
  options: NodeRendererOptions
): void {
  const { isDark, transform, hoveredNodeId, selectedNodeIds, useGradients = true, useShadows = true } = options

  ctx.save()

  nodes.forEach((node) => {
    if (!node.x || !node.y || !node.visible) return

    const radius = node.renderRadius ?? getNodeRadius(node)
    const isHovered = hoveredNodeId === node.id
    const isSelected = selectedNodeIds.has(node.id)
    const alpha = node.alpha ?? 1

    // Apply entrance animation alpha
    if (alpha <= 0) return

    ctx.globalAlpha = alpha * (node.opacity ?? 1)

    // Shadow effects
    if (useShadows && (isSelected || isHovered)) {
      ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = isSelected ? 12 : 6
      ctx.shadowOffsetY = isSelected ? 4 : 2
    } else {
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
    }

    // Node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)

    // Fill with gradient or solid color
    if (useGradients && node.color) {
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius)

      const lightColor = isHovered || isSelected ? lightenColor(node.color.light, 0.1) : node.color.light
      const darkColor = isHovered || isSelected ? lightenColor(node.color.dark, 0.1) : node.color.dark

      gradient.addColorStop(0, isDark ? darkColor : lightColor)
      gradient.addColorStop(1, isDark ? darkenColor(darkColor, 0.2) : darkenColor(lightColor, 0.2))

      ctx.fillStyle = gradient
    } else {
      const nodeColor = isDark ? '#CBD5E1' : '#475569'
      const highlightColor = isDark ? '#E2E8F0' : '#1E293B'
      ctx.fillStyle = isHovered || isSelected ? highlightColor : nodeColor
    }

    ctx.fill()

    // Border
    const borderColor = isDark ? '#94A3B8' : '#334155'
    ctx.lineWidth = (isSelected ? 2 : 1) / transform.k
    ctx.strokeStyle = borderColor
    ctx.stroke()

    // Reset shadow
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  })

  ctx.globalAlpha = 1
  ctx.restore()
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.floor((num >> 16) * (1 + percent)))
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00ff) * (1 + percent)))
  const b = Math.min(255, Math.floor((num & 0x0000ff) * (1 + percent)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - percent)))
  const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
