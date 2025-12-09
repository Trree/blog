import { Blog } from 'contentlayer/generated'

export interface GraphNode {
  id: string
  label: string
  title: string
  tags: string[]
  date: string
  slug: string
  group: string // 主要标签（用于分组着色）
}

export interface GraphEdge {
  from: string
  to: string
  value: number // 共享标签数量（边的权重）
  title: string // 悬停提示
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * 从博客文章数组生成图谱数据
 * @param posts 博客文章数组
 * @returns 图谱节点和边数据
 */
export function generateGraphData(posts: Blog[]): GraphData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  // 过滤掉草稿和没有标签的文章
  const validPosts = posts.filter((post) => !post.draft && post.tags && post.tags.length > 0)

  // 创建节点
  validPosts.forEach((post) => {
    nodes.push({
      id: post.slug || post._id,
      label: post.title,
      title: `${post.title}\n标签: ${post.tags?.join(', ')}`,
      tags: post.tags || [],
      date: post.date,
      slug: post.slug || '',
      group: post.tags?.[0] || 'default', // 使用第一个标签作为分组
    })
  })

  // 创建边：如果两篇文章共享标签，则创建连接
  for (let i = 0; i < validPosts.length; i++) {
    for (let j = i + 1; j < validPosts.length; j++) {
      const post1 = validPosts[i]
      const post2 = validPosts[j]

      const sharedTags = getSharedTags(post1.tags || [], post2.tags || [])

      if (sharedTags.length > 0) {
        edges.push({
          from: post1.slug || post1._id,
          to: post2.slug || post2._id,
          value: sharedTags.length,
          title: `共享标签: ${sharedTags.join(', ')}`,
        })
      }
    }
  }

  return { nodes, edges }
}

/**
 * 获取两个标签数组的共同标签
 */
function getSharedTags(tags1: string[], tags2: string[]): string[] {
  return tags1.filter((tag) => tags2.includes(tag))
}

/**
 * 根据标签过滤图谱数据
 * @param graphData 原始图谱数据
 * @param selectedTag 选中的标签
 * @returns 过滤后的图谱数据
 */
export function filterGraphByTag(graphData: GraphData, selectedTag: string): GraphData {
  if (!selectedTag) return graphData

  // 过滤包含指定标签的节点
  const filteredNodes = graphData.nodes.filter((node) => node.tags.includes(selectedTag))

  const nodeIds = new Set(filteredNodes.map((node) => node.id))

  // 过滤边：只保留两端都在过滤后节点中的边
  const filteredEdges = graphData.edges.filter(
    (edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)
  )

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  }
}

/**
 * 获取图谱统计信息
 */
export function getGraphStats(graphData: GraphData) {
  return {
    totalNodes: graphData.nodes.length,
    totalEdges: graphData.edges.length,
    averageConnections: graphData.nodes.length
      ? (graphData.edges.length * 2) / graphData.nodes.length
      : 0,
  }
}
