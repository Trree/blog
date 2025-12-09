'use client'

import { useEffect, useRef, useState } from 'react'
import { Network } from 'vis-network/standalone'
import type { Data, Options } from 'vis-network/standalone'
import { useParams, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import type { GraphData } from '@/lib/graph-utils'
import { LocaleTypes } from '@/app/[locale]/i18n/settings'

interface GraphViewProps {
  graphData: GraphData
  onNodeClick?: (nodeId: string) => void
  layoutMode?: 'forceAtlas2Based' | 'barnesHut' | 'hierarchicalRepulsion'
  physicsEnabled?: boolean
  forceStrength?: number
}

export default function GraphView({
  graphData,
  onNodeClick,
  layoutMode = 'forceAtlas2Based',
  physicsEnabled = true,
  forceStrength = -13
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)
  const { theme } = useTheme()
  const router = useRouter()
  const locale = useParams()?.locale as LocaleTypes
  const [stats, setStats] = useState({ nodes: 0, edges: 0 })
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])

  useEffect(() => {
    if (!containerRef.current || !graphData) return

    const isDark = theme === 'dark'

    // 为不同的标签组分配更清晰的颜色
    const colorPalette = [
      '#60A5FA', // blue-400
      '#34D399', // emerald-400
      '#FBBF24', // amber-400
      '#F87171', // red-400
      '#A78BFA', // violet-400
      '#F472B6', // pink-400
      '#22D3EE', // cyan-400
      '#FB923C', // orange-400
    ]

    const groupColors: Record<string, string> = {}
    const groups = Array.from(new Set(graphData.nodes.map((n) => n.group)))
    groups.forEach((group, index) => {
      groupColors[group] = colorPalette[index % colorPalette.length]
    })

    // 转换为 vis-network 数据格式 - 简洁样式
    const nodes = graphData.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      title: node.title,
      color: {
        background: groupColors[node.group] || '#60A5FA',
        border: groupColors[node.group] || '#60A5FA',
        highlight: {
          background: groupColors[node.group] || '#60A5FA',
          border: isDark ? '#FFFFFF' : '#000000',
        },
      },
      font: {
        color: isDark ? '#F9FAFB' : '#111827',
        size: 10,
        face: 'Inter, system-ui, -apple-system, sans-serif',
      },
      shape: 'dot',
      size: 5 + node.tags.length * 0.6, // 节点缩小70%
    }))

    const edges = graphData.edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      value: edge.value,
      title: edge.title,
      width: 0.5, // 缩小连线
      color: {
        color: isDark ? 'rgba(55, 65, 81, 0.4)' : 'rgba(229, 231, 235, 0.6)',
        highlight: isDark ? '#60A5FA' : '#3B82F6',
        opacity: 0.4,
      },
      smooth: {
        type: 'continuous' as const,
      },
    }))

    const data: Data = {
      nodes,
      edges,
    }

    // 配置物理引擎选项 - 优化的力导向参数
    const physicsOptions: any = {
      enabled: physicsEnabled,
      maxVelocity: 30,
      minVelocity: 0.75,
      timestep: 0.5,
      adaptiveTimestep: true,
      stabilization: {
        enabled: true,
        iterations: 1500,
        updateInterval: 50,
        onlyDynamicEdges: false,
        fit: true,
      },
    }

    // 根据布局模式配置 - 优化的力导向布局
    // forceStrength 控制引力/斥力强度，负值=斥力，正值=吸引力
    const forceMultiplier = forceStrength * 150 // 缩放系数

    if (layoutMode === 'forceAtlas2Based') {
      physicsOptions.solver = 'forceAtlas2Based'
      physicsOptions.forceAtlas2Based = {
        gravitationalConstant: forceMultiplier * 3,
        centralGravity: 0.01,
        springLength: 100,
        springConstant: 0.08,
        damping: 0.4,
        avoidOverlap: 0.5,
      }
    } else if (layoutMode === 'barnesHut') {
      physicsOptions.solver = 'barnesHut'
      physicsOptions.barnesHut = {
        gravitationalConstant: forceMultiplier,
        centralGravity: 0.1,
        springLength: 120,
        springConstant: 0.05,
        damping: 0.3,
        avoidOverlap: 0.2,
      }
    } else if (layoutMode === 'hierarchicalRepulsion') {
      physicsOptions.solver = 'hierarchicalRepulsion'
      physicsOptions.hierarchicalRepulsion = {
        centralGravity: 0.0,
        springLength: 200,
        springConstant: 0.01,
        nodeDistance: 150,
        damping: 0.4,
      }
    }

    const options: Options = {
      nodes: {
        borderWidth: 0,
        borderWidthSelected: 2,
        shadow: {
          enabled: true,
          color: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
          size: 8,
          x: 2,
          y: 3,
        },
      },
      edges: {
        width: 0.5,
        smooth: {
          enabled: true,
          type: 'continuous' as const,
          roundness: 0.3,
        },
        shadow: {
          enabled: true,
          color: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)',
          size: 3,
          x: 1,
          y: 1,
        },
      },
      physics: physicsOptions,
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
        navigationButtons: true,
        keyboard: {
          enabled: true,
          speed: { x: 10, y: 10, zoom: 0.02 },
          bindToWindow: false,
        },
      },
    }

    // 创建网络
    const network = new Network(containerRef.current, data, options)
    networkRef.current = network

    // 稳定化完成后的处理
    network.once('stabilizationIterationsDone', () => {
      console.log('Graph stabilization complete')
      // 稳定后可以选择性地降低物理引擎的计算频率
      if (physicsEnabled) {
        network.setOptions({
          physics: {
            enabled: true,
            stabilization: { enabled: false },
          },
        })
      }
    })

    // 监听物理引擎状态
    network.on('stabilizationProgress', (params) => {
      const progress = Math.round((params.iterations / params.total) * 100)
      if (progress % 20 === 0) {
        console.log(`Stabilization progress: ${progress}%`)
      }
    })

    // 节点点击事件 - 显示节点详情
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string
        const node = graphData.nodes.find((n) => n.id === nodeId)
        if (node) {
          setSelectedNode(node)
          const connectedNodes = network.getConnectedNodes(nodeId) as string[]
          setHighlightedNodes([nodeId, ...connectedNodes])
        }
      } else {
        setSelectedNode(null)
        setHighlightedNodes([])
      }
    })

    // 双击节点导航到文章
    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string
        const node = graphData.nodes.find((n) => n.id === nodeId)
        if (node && node.slug) {
          if (onNodeClick) {
            onNodeClick(nodeId)
          } else {
            router.push(`/${locale}/blog/${node.slug}`)
          }
        }
      }
    })

    // 背景点击取消选择
    network.on('deselectNode', () => {
      if (network.getSelectedNodes().length === 0) {
        setSelectedNode(null)
        setHighlightedNodes([])
      }
    })

    // 更新统计信息
    setStats({
      nodes: graphData.nodes.length,
      edges: graphData.edges.length,
    })

    // 清理
    return () => {
      network.destroy()
    }
  }, [graphData, theme, locale, router, onNodeClick, layoutMode, physicsEnabled, forceStrength])

  // 搜索功能
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!networkRef.current) return

    if (!query.trim()) {
      setHighlightedNodes([])
      setSelectedNode(null)
      return
    }

    const matchedNodes = graphData.nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(query.toLowerCase()) ||
        node.title.toLowerCase().includes(query.toLowerCase()) ||
        node.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    )

    if (matchedNodes.length > 0) {
      const nodeIds = matchedNodes.map((n) => n.id)
      setHighlightedNodes(nodeIds)
      networkRef.current.fit({
        nodes: nodeIds,
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad',
        },
      })
    }
  }

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // 重置视图
  const resetView = () => {
    if (networkRef.current) {
      networkRef.current.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad',
        },
      })
    }
  }

  // 聚焦到选中节点
  const focusNode = (nodeId: string) => {
    if (networkRef.current) {
      networkRef.current.focus(nodeId, {
        scale: 1.5,
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad',
        },
      })
    }
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      <div className="flex h-full gap-4">
        {/* 主图谱区域 */}
        <div className="flex flex-1 flex-col">
          {/* 顶部工具栏 - 简洁设计 */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* 左侧：统计信息 - 简洁版 */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">{locale === 'zh' ? '节点' : 'Nodes'}:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.nodes}</span>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">{locale === 'zh' ? '连接' : 'Edges'}:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.edges}</span>
                </div>
              </div>

              {/* 右侧：搜索和控制按钮 */}
              <div className="flex flex-1 items-center justify-end gap-2">
                {/* 搜索框 */}
                <div className="relative max-w-xs flex-1">
                  <input
                    type="text"
                    placeholder={locale === 'zh' ? '搜索节点...' : 'Search nodes...'}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pr-3 pl-9 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                  <svg
                    className="absolute top-2 left-3 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* 重置视图按钮 */}
                <button
                  onClick={resetView}
                  className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  title={locale === 'zh' ? '重置视图' : 'Reset View'}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                {/* 全屏按钮 */}
                <button
                  onClick={toggleFullscreen}
                  className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  title={locale === 'zh' ? (isFullscreen ? '退出全屏' : '全屏') : (isFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
                >
                  {isFullscreen ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 图谱容器 - 简洁设计 */}
          <div className="relative flex-1">
            <div
              ref={containerRef}
              className={`${
                isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-[600px]'
              } w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900`}
            />

            {/* 加载指示器 */}
            {!networkRef.current && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <div className="text-center">
                  <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'zh' ? '加载图谱中...' : 'Loading graph...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧边栏 - 节点详情 */}
        {selectedNode && (
          <div className="w-80 flex-shrink-0 animate-slide-in">
            <div className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
              {/* 头部 */}
              <div className="border-b border-gray-200 bg-primary-500 p-4 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-white">
                    {locale === 'zh' ? '节点详情' : 'Node Details'}
                  </h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 内容 */}
              <div className="space-y-4 p-4">
                {/* 标题 */}
                <div>
                  <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                    {selectedNode.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedNode.title}</p>
                </div>

                {/* 标签 */}
                <div>
                  <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {locale === 'zh' ? '标签' : 'Tags'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-md bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 连接信息 */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {highlightedNodes.length - 1} {locale === 'zh' ? '个相关节点' : 'related nodes'}
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => selectedNode.slug && router.push(`/${locale}/blog/${selectedNode.slug}`)}
                    className="w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                  >
                    {locale === 'zh' ? '查看文章' : 'View Article'}
                  </button>
                  <button
                    onClick={() => focusNode(selectedNode.id)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {locale === 'zh' ? '聚焦节点' : 'Focus Node'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
