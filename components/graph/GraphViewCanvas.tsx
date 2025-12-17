'use client'

import { useEffect, useRef, useState, useCallback, type ReactElement } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import * as d3 from 'd3'
import type { GraphData } from '@/lib/graph-utils'
import type { LocaleTypes } from '@/app/[locale]/i18n/settings'
import type { RenderQueue } from './types'

// Hooks
import { useGraphSimulation } from './hooks/useGraphSimulation'
import { useQuadtree } from './hooks/useQuadtree'
import { useGraphInteraction } from './hooks/useGraphInteraction'

// Renderers
import { renderEdges } from './renderers/edgeRenderer'
import { renderNodes } from './renderers/nodeRenderer'
import { renderLabels } from './renderers/labelRenderer'

// Utils
import { throttle, rafThrottle } from './utils/performance'
import { screenToGraph } from './utils/transforms'
import { animate, staggeredAnimate } from './utils/animations'

// Components
import CanvasLayers, { type CanvasLayersRef } from './layers/CanvasLayers'

interface GraphViewCanvasProps {
  graphData: GraphData
  onNodeClick?: (nodeId: string) => void
}

export default function GraphViewCanvas({
  graphData,
  onNodeClick,
}: GraphViewCanvasProps): ReactElement {
  const canvasRef = useRef<CanvasLayersRef | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const router = useRouter()
  const locale = useParams()?.locale as LocaleTypes
  const isDark = theme === 'dark'

  const [dimensions, setDimensions] = useState({ width: 800, height: 700 })
  const [stats, setStats] = useState({ nodes: 0, edges: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<GraphData['nodes'][number] | null>(null)

  // Transform state
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)

  // Render queue for efficient updates
  const renderQueueRef = useRef<RenderQueue>({
    edges: true,
    nodes: true,
    labels: true,
  })

  // Mark a layer as dirty
  const markDirty = useCallback((layer: keyof RenderQueue) => {
    renderQueueRef.current[layer] = true
  }, [])

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [isFullscreen])

  // Render callback for simulation
  const handleTick = useCallback(() => {
    markDirty('nodes')
    markDirty('labels')
  }, [markDirty])

  // Initialize simulation
  const { nodes, links, simulation, tagColorMap } = useGraphSimulation(graphData, dimensions, handleTick)

  // Initialize quadtree for spatial indexing
  const { findNode } = useQuadtree(nodes)

  // Initialize interaction state
  const interaction = useGraphInteraction()
  const { state: interactionState, setHoveredNode, selectNode, setDraggedNode } = interaction

  // Entrance animation
  useEffect(() => {
    const cancel = staggeredAnimate(nodes, 50, (node, index) => {
      animate({
        from: 0,
        to: 1,
        duration: 300,
        easing: 'easeOutCubic',
        onUpdate: (value) => {
          node.alpha = value
          markDirty('nodes')
          markDirty('labels')
        },
      })
    })

    return cancel
  }, [nodes, markDirty])

  // Main render function
  const render = useCallback(() => {
    const canvases = canvasRef.current
    if (!canvases || !canvases.edgesCtx || !canvases.nodesCtx || !canvases.labelsCtx) return

    const { edgesCtx, nodesCtx, labelsCtx } = canvases
    const { width, height } = dimensions
    const transform = transformRef.current
    const queue = renderQueueRef.current

    // Render edges layer
    if (queue.edges) {
      edgesCtx.save()
      edgesCtx.clearRect(0, 0, width, height)
      edgesCtx.translate(transform.x, transform.y)
      edgesCtx.scale(transform.k, transform.k)

      renderEdges(edgesCtx, links, {
        isDark,
        transform,
        curvedEdges: true,
        gradientEdges: true,
      })

      edgesCtx.restore()
      queue.edges = false
    }

    // Render nodes layer
    if (queue.nodes) {
      nodesCtx.save()
      nodesCtx.clearRect(0, 0, width, height)
      nodesCtx.translate(transform.x, transform.y)
      nodesCtx.scale(transform.k, transform.k)

      renderNodes(nodesCtx, nodes, {
        isDark,
        transform,
        hoveredNodeId: interactionState.hoveredNode?.id || null,
        selectedNodeIds: interactionState.selectedNodes,
        useGradients: true,
        useShadows: true,
      })

      nodesCtx.restore()
      queue.nodes = false
    }

    // Render labels layer
    if (queue.labels) {
      labelsCtx.save()
      labelsCtx.clearRect(0, 0, width, height)
      labelsCtx.translate(transform.x, transform.y)
      labelsCtx.scale(transform.k, transform.k)

      renderLabels(labelsCtx, nodes, {
        isDark,
        transform,
        hoveredNodeId: interactionState.hoveredNode?.id || null,
        selectedNodeIds: interactionState.selectedNodes,
      })

      labelsCtx.restore()
      queue.labels = false
    }
  }, [dimensions, nodes, links, isDark, interactionState])

  // Request render on animation frame
  const requestRender = useCallback(
    rafThrottle(() => render()),
    [render]
  )

  // Watch for render queue changes
  useEffect(() => {
    const interval = setInterval(() => {
      const queue = renderQueueRef.current
      if (queue.edges || queue.nodes || queue.labels) {
        requestRender()
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [requestRender])

  // Setup zoom behavior
  useEffect(() => {
    const labelsCanvas = canvasRef.current?.labelsCanvas
    if (!labelsCanvas) return

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event: d3.D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        transformRef.current = event.transform
        markDirty('edges')
        markDirty('nodes')
        markDirty('labels')
      })

    d3.select(labelsCanvas).call(zoom)

    return () => {
      d3.select(labelsCanvas).on('.zoom', null)
    }
  }, [markDirty])

  // Mouse interaction handlers
  const handleMouseMove = useCallback(
    throttle((event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current?.labelsCanvas
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const { x, y } = screenToGraph(screenX, screenY, transformRef.current)

      const node = findNode(x, y, 15)

      if (node !== interactionState.hoveredNode) {
        setHoveredNode(node || null)
        canvas.style.cursor = node ? 'pointer' : 'grab'
        markDirty('nodes')
        markDirty('labels')
      }
    }, 16),
    [findNode, interactionState.hoveredNode, setHoveredNode, markDirty]
  )

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current?.labelsCanvas
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const { x, y } = screenToGraph(screenX, screenY, transformRef.current)

      const node = findNode(x, y, 15)

      if (node) {
        const isMulti = event.shiftKey || event.metaKey || event.ctrlKey
        selectNode(node, isMulti)

        const graphNode = graphData.nodes.find((n) => n.id === node.id)
        setSelectedNode(graphNode || null)

        // Animate zoom to node
        if (!isMulti && node.x != null && node.y != null) {
          const targetScale = Math.max(transformRef.current.k, 1.2)
          const targetX = dimensions.width / 2 - node.x * targetScale
          const targetY = dimensions.height / 2 - node.y * targetScale

          d3.select(canvas)
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .call(
              d3.zoom<HTMLCanvasElement, unknown>().transform as any,
              d3.zoomIdentity.translate(targetX, targetY).scale(targetScale)
            )
        }

        markDirty('nodes')
        markDirty('labels')
      } else {
        setSelectedNode(null)
        selectNode(node as any, false) // Deselect
        markDirty('nodes')
        markDirty('labels')
      }
    },
    [findNode, selectNode, graphData.nodes, dimensions, markDirty]
  )

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current?.labelsCanvas
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const { x, y } = screenToGraph(screenX, screenY, transformRef.current)

      const node = findNode(x, y, 15)

      if (node && node.slug) {
        if (onNodeClick) {
          onNodeClick(node.id)
        } else {
          router.push(`/${locale}/blog/${node.slug}`)
        }
      }
    },
    [findNode, onNodeClick, router, locale]
  )

  // Update stats
  useEffect(() => {
    setStats({
      nodes: graphData.nodes.length,
      edges: graphData.edges.length,
    })
  }, [graphData])

  // Initial render
  useEffect(() => {
    markDirty('edges')
    markDirty('nodes')
    markDirty('labels')
  }, [nodes, links, markDirty])

  // Reset view function
  const resetView = () => {
    const canvas = canvasRef.current?.labelsCanvas
    if (!canvas) return

    d3.select(canvas)
      .transition()
      .duration(750)
      .call(
        d3.zoom<HTMLCanvasElement, unknown>().transform as any,
        d3.zoomIdentity.translate(0, 0).scale(1)
      )
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const graphHeightClass = isFullscreen ? 'h-screen' : 'h-[700px]'
  const toolbarCardClass = `mb-4 rounded-2xl border ${
    isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200/70 bg-white/80'
  } p-4 shadow-sm backdrop-blur`
  const iconButtonClass = `rounded-xl border ${
    isDark
      ? 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
      : 'border-slate-200 bg-white/80 text-slate-500 hover:bg-white'
  } p-2 transition-colors`
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 p-4' : ''}`}
    >
      <div ref={containerRef} className="flex h-full flex-col">
        {/* Minimal toolbar */}
        <div className={toolbarCardClass}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {stats.nodes} {locale === 'zh' ? '节点' : 'nodes'} • {stats.edges}{' '}
              {locale === 'zh' ? '连接' : 'edges'}
            </div>

            <div className="flex items-center gap-1">
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

        {/* Canvas container */}
        <div className="relative flex-1">
          <div
            className={`relative w-full ${graphHeightClass} overflow-hidden rounded-3xl border ${
              isDark ? 'border-slate-800' : 'border-slate-200/70'
            } shadow-[0_25px_70px_rgba(15,23,42,0.18)] dark:shadow-[0_25px_70px_rgba(2,6,23,0.65)]`}
            style={{
              background: isDark ? '#0F172A' : '#FAFAFA',
            }}
          >
            <CanvasLayers
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              onMouseMove={handleMouseMove}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            />
          </div>
        </div>
      </div>

      {/* Compact node details overlay */}
      {selectedNode && (
        <div className="absolute top-20 right-4 w-64 rounded-lg border bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg backdrop-blur z-10">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedNode.label}
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className={`text-xs ${mutedTextClass} mb-2`}>{selectedNode.title}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {selectedNode.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => selectedNode.slug && router.push(`/${locale}/blog/${selectedNode.slug}`)}
            className="w-full text-xs py-1.5 rounded bg-sky-500 hover:bg-sky-600 text-white transition-colors"
          >
            {locale === 'zh' ? '查看文章' : 'View Article'}
          </button>
        </div>
      )}
    </div>
  )
}
