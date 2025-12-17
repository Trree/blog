import type { Color, D3Node } from '../types'

export const TAG_COLORS: Color[] = [
  { light: '#3B82F6', dark: '#60A5FA', name: 'blue' }, // Tech
  { light: '#10B981', dark: '#34D399', name: 'green' }, // Tutorial
  { light: '#F59E0B', dark: '#FBBF24', name: 'amber' }, // Design
  { light: '#EF4444', dark: '#F87171', name: 'red' }, // Important
  { light: '#8B5CF6', dark: '#A78BFA', name: 'purple' }, // Theory
  { light: '#EC4899', dark: '#F472B6', name: 'pink' }, // Creative
  { light: '#14B8A6', dark: '#2DD4BF', name: 'teal' }, // Tools
  { light: '#F97316', dark: '#FB923C', name: 'orange' }, // News
]

/**
 * Build a map of tag to color index based on frequency
 */
export function buildTagColorMap(nodes: D3Node[]): Map<string, number> {
  const tagFrequency = new Map<string, number>()

  // Count tag frequency
  nodes.forEach((node) => {
    node.tags.forEach((tag) => {
      tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1)
    })
  })

  // Sort tags by frequency
  const sortedTags = Array.from(tagFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])

  // Assign indices
  const tagColorMap = new Map<string, number>()
  sortedTags.forEach((tag, index) => {
    tagColorMap.set(tag, index)
  })

  return tagColorMap
}

/**
 * Assign a color to a node based on its primary tag
 */
export function assignNodeColor(node: D3Node, tagColorMap: Map<string, number>): Color {
  const primaryTag = node.tags[0]
  const index = tagColorMap.get(primaryTag) || 0
  return TAG_COLORS[index % TAG_COLORS.length]
}

/**
 * Calculate opacity based on connection count
 */
export function calculateNodeOpacity(connections: number, maxConnections: number): number {
  if (maxConnections === 0) return 0.8
  return 0.6 + (connections / maxConnections) * 0.4
}

/**
 * Get all unique tags with their colors
 */
export function getTagLegend(
  nodes: D3Node[],
  tagColorMap: Map<string, number>
): Array<{ tag: string; color: Color; count: number }> {
  const tagCounts = new Map<string, number>()

  nodes.forEach((node) => {
    node.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({
      tag,
      color: TAG_COLORS[(tagColorMap.get(tag) || 0) % TAG_COLORS.length],
      count,
    }))
    .sort((a, b) => b.count - a.count)
}
