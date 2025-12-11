'use client'

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { Network, type Data, type Options } from 'vis-network/standalone'
import { useParams, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import type { GraphData } from '@/lib/graph-utils'
import type { LocaleTypes } from '@/app/[locale]/i18n/settings'

const GROUP_BASE_COLORS = [
  '#5B8DEF',
  '#8E6CFF',
  '#1CC8EE',
  '#3FD6A0',
  '#FFB347',
  '#FF7A93',
  '#7AD3FF',
  '#B69CFF',
]

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

const adjustColor = (hex: string, amount: number) => {
  const { r, g, b } = hexToRgb(hex)
  const clamp = (value: number) => Math.max(0, Math.min(value, 255))
  const mixChannel = (channel: number) => {
    const target = amount < 0 ? 0 : 255
    return clamp(Math.round(channel + (target - channel) * Math.abs(amount)))
  }
  return `rgb(${mixChannel(r)}, ${mixChannel(g)}, ${mixChannel(b)})`
}

const colorWithAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type VisNodeFont = {
  size?: number
  color?: string
  background?: string
  strokeWidth?: number
}

interface VisNodeDataset {
  get: (id: string) => ({ font?: VisNodeFont } & { id: string }) | null | undefined
  update: (node: { id: string; font?: VisNodeFont }) => void
}

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
  forceStrength = -13,
}: GraphViewProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)
  const { theme } = useTheme()
  const router = useRouter()
  const locale = useParams()?.locale as LocaleTypes
  const [stats, setStats] = useState({ nodes: 0, edges: 0 })
  const [selectedNode, setSelectedNode] = useState<GraphData['nodes'][number] | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const previousHighlightsRef = useRef<string[]>([])
  const isDark = theme === 'dark'

  const groupColors = useMemo(() => {
    const mapping: Record<string, string> = {}
    const groups = Array.from(new Set(graphData.nodes.map((node) => node.group)))
    groups.forEach((group, index) => {
      mapping[group] = GROUP_BASE_COLORS[index % GROUP_BASE_COLORS.length]
    })
    return mapping
  }, [graphData])

  const graphBackgroundStyle = useMemo(
    () => ({
      background: isDark
        ? 'linear-gradient(135deg, #020617 0%, #0F172A 60%, #1E1B4B 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 55%, #E0E7FF 100%)',
    }),
    [isDark]
  )

  const graphPatternStyle = useMemo(
    () => ({
      backgroundImage: isDark
        ? 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.08) 1px, transparent 70%)'
        : 'radial-gradient(circle at 25% 25%, rgba(15,23,42,0.08) 1px, transparent 70%)',
      backgroundSize: '140px 140px',
      opacity: isDark ? 0.35 : 0.5,
    }),
    [isDark]
  )
  const graphHeightClass = isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-[600px]'
  const toolbarCardClass = `mb-4 rounded-2xl border ${
    isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200/70 bg-white/80'
  } p-4 shadow-sm backdrop-blur`
  const iconButtonClass = `rounded-xl border ${
    isDark
      ? 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
      : 'border-slate-200 bg-white/80 text-slate-500 hover:bg-white'
  } p-2 transition-colors`
  const overlayCardClass = `rounded-2xl px-3 py-2 shadow-lg backdrop-blur ${
    isDark ? 'bg-slate-900/70 text-slate-200' : 'bg-white/80 text-slate-600'
  }`
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500'

  useEffect(() => {
    if (!containerRef.current || !graphData) return

    const nodes = graphData.nodes.map((node) => {
      const baseColor = groupColors[node.group] || GROUP_BASE_COLORS[0]
      return {
        id: node.id,
        label: node.label,
        title: node.title,
        slug: node.slug,
        tags: node.tags,
        color: {
          background: colorWithAlpha(baseColor, isDark ? 0.85 : 0.92),
          border: adjustColor(baseColor, -0.45),
          highlight: {
            background: adjustColor(baseColor, 0.18),
            border: adjustColor(baseColor, -0.1),
          },
        },
        font: {
          color: isDark ? '#E2E8F0' : '#0F172A',
          size: 0.01,
          face: 'Inter, system-ui, -apple-system, sans-serif',
        },
        shape: 'dot',
        size: Math.min(28, 12 + node.tags.length * 1.5),
        shadow: {
          enabled: true,
          color: colorWithAlpha(baseColor, 0.55),
          size: 32,
          x: 0,
          y: 0,
        },
      }
    })

    const baseEdgeColor = isDark ? 'rgba(148, 163, 184, 0.32)' : 'rgba(148, 163, 184, 0.45)'
    const highlightEdgeColor = isDark ? 'rgba(125, 211, 252, 0.9)' : 'rgba(14, 165, 233, 0.85)'
    const edges = graphData.edges.map((edge) => {
      const weight = edge.value ?? 1
      return {
        from: edge.from,
        to: edge.to,
        value: edge.value,
        title: edge.title,
        width: 0.8 + Math.min(weight, 5) * 0.25,
        color: {
          color: baseEdgeColor,
          hover: highlightEdgeColor,
          highlight: highlightEdgeColor,
          opacity: 0.75,
        },
        smooth: {
          type: 'continuous' as const,
          roundness: 0.35,
        },
      }
    })

    const data: Data = { nodes, edges }

    const physicsOptions: NonNullable<Options['physics']> = {
      enabled: physicsEnabled,
      maxVelocity: 25,
      minVelocity: 0.5,
      timestep: 0.6,
      adaptiveTimestep: true,
      stabilization: {
        enabled: true,
        iterations: 1200,
        updateInterval: 50,
        onlyDynamicEdges: false,
        fit: true,
      },
    }

    const forceMultiplier = forceStrength * 150

    if (layoutMode === 'forceAtlas2Based') {
      physicsOptions.solver = 'forceAtlas2Based'
      physicsOptions.forceAtlas2Based = {
        gravitationalConstant: forceMultiplier * 2.5,
        centralGravity: 0.012,
        springLength: 110,
        springConstant: 0.08,
        damping: 0.35,
        avoidOverlap: 0.35,
      }
    } else if (layoutMode === 'barnesHut') {
      physicsOptions.solver = 'barnesHut'
      physicsOptions.barnesHut = {
        gravitationalConstant: forceMultiplier,
        centralGravity: 0.08,
        springLength: 140,
        springConstant: 0.045,
        damping: 0.3,
        avoidOverlap: 0.2,
      }
    } else if (layoutMode === 'hierarchicalRepulsion') {
      physicsOptions.solver = 'hierarchicalRepulsion'
      physicsOptions.hierarchicalRepulsion = {
        centralGravity: 0,
        springLength: 220,
        springConstant: 0.01,
        nodeDistance: 160,
        damping: 0.4,
      }
    }

    const options: Options = {
      nodes: {
        borderWidth: 0,
        borderWidthSelected: 0,
        shape: 'dot',
        shadow: true,
        chosen: {
          node(values, _id, selected, hovering) {
            const baseSize = values.size || 16
            if (hovering || selected) {
              values.size = baseSize * 1.12
              values.shadow = true
              values.shadowSize = selected ? 55 : 38
              values.shadowColor = values.color?.background || '#5B8DEF'
              values.font = {
                ...(values.font ?? {}),
                size: 14,
                color: isDark ? '#F8FAFC' : '#0F172A',
                background: isDark ? 'rgba(2, 6, 23, 0.85)' : 'rgba(255,255,255,0.88)',
                strokeWidth: 0,
              }
            }
          },
        },
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'continuous' as const,
          roundness: 0.35,
        },
        shadow: {
          enabled: true,
          color: isDark ? 'rgba(2, 6, 23, 0.45)' : 'rgba(15, 23, 42, 0.12)',
          size: 12,
          x: 0,
          y: 0,
        },
        selectionWidth: 2,
        color: {
          color: baseEdgeColor,
          opacity: 0.6,
        },
        chosen: {
          edge(values) {
            values.width = (values.width || 1) + 0.8
          },
        },
      },
      physics: physicsOptions,
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        tooltipDelay: 120,
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

    const network = new Network(containerRef.current, data, options)
    networkRef.current = network

    network.once('stabilizationIterationsDone', () => {
      if (physicsEnabled) {
        network.setOptions({
          physics: {
            enabled: true,
            stabilization: { enabled: false },
          },
        })
      }
    })

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

    network.on('deselectNode', () => {
      if (network.getSelectedNodes().length === 0) {
        setSelectedNode(null)
        setHighlightedNodes([])
      }
    })

    setStats({
      nodes: graphData.nodes.length,
      edges: graphData.edges.length,
    })

    return () => {
      network.destroy()
    }
  }, [
    graphData,
    theme,
    locale,
    router,
    onNodeClick,
    layoutMode,
    physicsEnabled,
    forceStrength,
    groupColors,
  ])

  useEffect(() => {
    const network = networkRef.current
    if (!network) return
    const dataset = network.body?.data?.nodes as VisNodeDataset | undefined
    if (!dataset) return

    const previous = previousHighlightsRef.current
    const toReset = previous.filter((id) => !highlightedNodes.includes(id))
    toReset.forEach((id) => {
      const node = dataset.get(id)
      if (node) {
        dataset.update({
          id,
          font: {
            ...(node.font || {}),
            size: 0.01,
            background: undefined,
          },
        })
      }
    })

    highlightedNodes.forEach((id) => {
      const node = dataset.get(id)
      if (node) {
        dataset.update({
          id,
          font: {
            ...(node.font || {}),
            size: 13,
            color: isDark ? '#F8FAFC' : '#0F172A',
            background: isDark ? 'rgba(2, 6, 23, 0.82)' : 'rgba(255,255,255,0.9)',
            strokeWidth: 0,
          },
        })
      }
    })

    previousHighlightsRef.current = highlightedNodes
  }, [highlightedNodes, isDark])

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

  const connectionDensity =
    stats.nodes > 1 ? Math.min(100, (stats.edges / (stats.nodes * (stats.nodes - 1))) * 100) : 0

  return (
    <div
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950' : ''}`}
    >
      <div className="flex h-full gap-4 max-lg:flex-col">
        {/* 主图谱区域 */}
        <div className="flex flex-1 flex-col">
          {/* 顶部工具栏 - 简洁设计 */}
          <div className={toolbarCardClass}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* 左侧：统计信息 - 简洁版 */}
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className={mutedTextClass}>{locale === 'zh' ? '节点' : 'Nodes'}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stats.nodes}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                  <span className={mutedTextClass}>{locale === 'zh' ? '连接' : 'Edges'}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stats.edges}
                  </span>
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
                    className={`w-full rounded-xl border ${
                      isDark
                        ? 'border-slate-700 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400/40'
                        : 'border-slate-200 bg-white/80 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-sky-500/30'
                    } py-2 pr-3 pl-10 text-sm shadow-inner transition-colors focus:ring-2 focus:outline-none`}
                  />
                  <svg
                    className="absolute top-2.5 left-3 h-4 w-4 text-slate-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* 重置视图按钮 */}
                <button
                  onClick={resetView}
                  className={iconButtonClass}
                  title={locale === 'zh' ? '重置视图' : 'Reset View'}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>

                {/* 全屏按钮 */}
                <button
                  onClick={toggleFullscreen}
                  className={iconButtonClass}
                  title={
                    locale === 'zh'
                      ? isFullscreen
                        ? '退出全屏'
                        : '全屏'
                      : isFullscreen
                        ? 'Exit Fullscreen'
                        : 'Fullscreen'
                  }
                >
                  {isFullscreen ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 图谱容器 - 霓虹效果 */}
          <div className="relative flex-1">
            <div
              className={`relative w-full ${graphHeightClass} overflow-hidden rounded-3xl border ${
                isDark ? 'border-slate-800' : 'border-slate-200/70'
              } shadow-[0_25px_70px_rgba(15,23,42,0.18)] dark:shadow-[0_25px_70px_rgba(2,6,23,0.65)]`}
            >
              <div className="pointer-events-none absolute inset-0" style={graphBackgroundStyle} />
              <div className="pointer-events-none absolute inset-0" style={graphPatternStyle} />
              <div ref={containerRef} className="relative z-[1] h-full w-full" />

              {!networkRef.current && (
                <div className="absolute inset-0 z-[2] flex items-center justify-center bg-white/80 backdrop-blur-xl dark:bg-slate-950/80">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500 dark:border-slate-800 dark:border-t-sky-300" />
                    <p className={`text-sm ${mutedTextClass}`}>
                      {locale === 'zh' ? '加载图谱中...' : 'Loading graph...'}
                    </p>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-3 text-xs font-semibold">
                <div className={overlayCardClass}>
                  <div className={`text-[10px] tracking-wide uppercase ${mutedTextClass}`}>
                    {locale === 'zh' ? '节点' : 'Nodes'}
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.nodes}
                  </div>
                </div>
                <div className={overlayCardClass}>
                  <div className={`text-[10px] tracking-wide uppercase ${mutedTextClass}`}>
                    {locale === 'zh' ? '连线' : 'Edges'}
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.edges}
                  </div>
                </div>
                <div className={overlayCardClass}>
                  <div className={`text-[10px] tracking-wide uppercase ${mutedTextClass}`}>
                    {locale === 'zh' ? '密度' : 'Density'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {connectionDensity.toFixed(1)}%
                    </span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                      <div
                        className="h-full rounded-full bg-sky-400"
                        style={{ width: `${Math.min(connectionDensity, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧边栏 - 节点详情 */}
        {selectedNode ? (
          <div className="animate-slide-in w-80 flex-shrink-0 max-lg:w-full">
            <div
              className={`h-full overflow-hidden rounded-2xl border ${
                isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200/70 bg-white/85'
              } shadow-xl backdrop-blur`}
            >
              {/* 头部 */}
              <div className="border-b border-white/10 bg-gradient-to-r from-sky-500 to-indigo-500 p-4 dark:border-slate-800/80">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-white">
                    {locale === 'zh' ? '节点详情' : 'Node Details'}
                  </h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 内容 */}
              <div className="space-y-4 p-4">
                {/* 标题 */}
                <div>
                  <h4 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                    {selectedNode.label}
                  </h4>
                  <p className={`text-sm ${mutedTextClass}`}>{selectedNode.title}</p>
                </div>

                {/* 标签 */}
                <div>
                  <div className={`mb-2 text-xs font-medium ${mutedTextClass}`}>
                    {locale === 'zh' ? '标签' : 'Tags'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-md bg-sky-100/80 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-400/10 dark:text-sky-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 连接信息 */}
                <div className={`text-sm ${mutedTextClass}`}>
                  {highlightedNodes.length - 1} {locale === 'zh' ? '个相关节点' : 'related nodes'}
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() =>
                      selectedNode.slug && router.push(`/${locale}/blog/${selectedNode.slug}`)
                    }
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.01]"
                  >
                    {locale === 'zh' ? '查看文章' : 'View Article'}
                  </button>
                  <button
                    onClick={() => focusNode(selectedNode.id)}
                    className={`w-full rounded-xl border ${
                      isDark
                        ? 'border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-900'
                        : 'border-slate-200 bg-white/90 text-slate-700 hover:bg-white'
                    } py-2 text-sm font-medium transition-colors`}
                  >
                    {locale === 'zh' ? '聚焦节点' : 'Focus Node'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
