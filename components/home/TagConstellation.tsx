'use client'

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { Network, type Data, type Options } from 'vis-network/standalone'
import { useParams, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useTagStore } from '@/components/util/useTagStore'

export interface TagNodeData {
  id: string
  label: string
  count: number
  lastActive: string
}

const PALETTE = [
  '#5B8DEF',
  '#8E6CFF',
  '#1CC8EE',
  '#3FD6A0',
  '#FFB347',
  '#FF7A93',
  '#7AD3FF',
  '#B69CFF',
]

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

const colorWithAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

interface TagConstellationProps {
  tagNodes: TagNodeData[]
}

export default function TagConstellation({ tagNodes }: TagConstellationProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const router = useRouter()
  const locale = useParams()?.locale as LocaleTypes
  const setSelectedTag = useTagStore((state) => state.setSelectedTag)
  const [hoveredNode, setHoveredNode] = useState<TagNodeData | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const tagById = useMemo(() => {
    const map = new Map<string, TagNodeData>()
    tagNodes.forEach((node) => map.set(node.id, node))
    return map
  }, [tagNodes])

  const nodes = useMemo(() => {
    const maxCount = Math.max(1, ...tagNodes.map((node) => node.count))
    const now = Date.now()
    const freshnessWindowDays = 180
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    return tagNodes.map((node) => {
      const baseColor = PALETTE[hashString(node.id) % PALETTE.length]
      const lastActiveMs = Date.parse(node.lastActive)
      const daysSince = Number.isFinite(lastActiveMs) ? (now - lastActiveMs) / 86_400_000 : 999
      const freshness = Math.max(0, Math.min(1, 1 - daysSince / freshnessWindowDays))
      const alpha = (isDark ? 0.35 : 0.25) + freshness * 0.6
      const size = 10 + Math.log2(node.count + 1) * 8
      return {
        id: node.id,
        label: node.label,
        title: `${node.label} · ${node.count}`,
        value: node.count,
        size,
        shape: 'dot',
        color: {
          background: colorWithAlpha(baseColor, alpha),
          border: colorWithAlpha(baseColor, alpha + 0.15),
          highlight: {
            background: colorWithAlpha(baseColor, Math.min(1, alpha + 0.25)),
            border: colorWithAlpha(baseColor, 0.9),
          },
        },
        font: {
          color: isDark ? '#E2E8F0' : '#0F172A',
          size: 12,
          face: 'Inter, system-ui, -apple-system, sans-serif',
        },
        shadow: {
          enabled: true,
          color: colorWithAlpha(baseColor, isDark ? 0.6 : 0.45),
          size: 24,
          x: 0,
          y: 0,
        },
        scaling: {
          min: isMobile ? 12 : 8,
          max: isMobile ? 42 : 36 + Math.log2(maxCount),
        },
      }
    })
  }, [tagNodes, isDark])

  useEffect(() => {
    if (!containerRef.current || tagNodes.length === 0) return

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const data: Data = { nodes, edges: [] }

    const options: Options = {
      nodes: {
        borderWidth: 0,
        borderWidthSelected: 0,
        shadow: true,
        chosen: {
          node(values: any, _id: any, selected: boolean, hovering: boolean) {
            const baseSize = values.size || 16
            if (hovering || selected) {
              values.size = baseSize * 1.12
              values.shadow = true
              values.shadowSize = selected ? 46 : 34
              values.font = {
                ...(values.font ?? {}),
                size: 14,
                background: isDark ? 'rgba(2, 6, 23, 0.85)' : 'rgba(255,255,255,0.9)',
                strokeWidth: 0,
              }
            }
          },
        } as any,
      },
      edges: {
        smooth: false,
        color: { opacity: 0 },
      },
      interaction: {
        hover: true,
        tooltipDelay: 80,
        zoomView: true,
        dragView: true,
        hideEdgesOnDrag: true,
        hideEdgesOnZoom: true,
      },
      physics: {
        enabled: true,
        solver: 'barnesHut',
        barnesHut: {
          gravitationalConstant: isMobile ? -15_000 : -18_000,
          centralGravity: 0.08,
          springLength: isMobile ? 100 : 140,
          springConstant: 0.045,
          damping: isMobile ? 0.4 : 0.3,
          avoidOverlap: isMobile ? 0.3 : 0.25,
        },
        stabilization: {
          enabled: true,
          iterations: 900,
          fit: true,
        },
      },
    }

    const network = new Network(containerRef.current, data, options)
    networkRef.current = network

    network.on('hoverNode', (params) => {
      const node = tagById.get(params.node as string) ?? null
      setHoveredNode(node)
      setTooltipPos({ x: params.pointer.DOM.x, y: params.pointer.DOM.y })
    })

    network.on('blurNode', () => {
      setHoveredNode(null)
      setTooltipPos(null)
    })

    network.on('click', (params) => {
      const nodeId = params.nodes?.[0] as string | undefined
      if (!nodeId) return
      setSelectedTag(nodeId)
      router.push(`/${locale}/blog`)
    })

    const handleResize = () => {
      network.fit({ animation: { duration: 300, easingFunction: 'easeInOutQuad' } })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      network.destroy()
      networkRef.current = null
    }
  }, [nodes, tagNodes.length, isDark, locale, router, setSelectedTag, tagById])

  const backgroundStyle = useMemo(
    () => ({
      background: isDark
        ? 'linear-gradient(135deg, #020617 0%, #0F172A 60%, #1E1B4B 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 55%, #E0E7FF 100%)',
    }),
    [isDark]
  )

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0" style={backgroundStyle} aria-hidden="true" />
      <div ref={containerRef} className="relative h-[360px] w-full sm:h-[420px]" />
      {hoveredNode && tooltipPos ? (
        <div
          className="pointer-events-none absolute z-10 rounded-2xl border border-white/15 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 shadow-lg backdrop-blur dark:border-white/10"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
          role="tooltip"
        >
          <div className="font-semibold">{hoveredNode.label}</div>
          <div className="mt-0.5 opacity-80">{hoveredNode.count} posts</div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center text-xs text-slate-200/80 dark:text-slate-300/80">
        <span className="hidden sm:inline">Drag to explore · Scroll to zoom · Click to open</span>
        <span className="sm:hidden">Tap and drag · Pinch to zoom · Tap to filter</span>
      </div>
    </div>
  )
}
