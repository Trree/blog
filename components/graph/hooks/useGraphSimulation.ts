import { useEffect, useMemo, useRef } from 'react'
import * as d3 from 'd3'
import type { GraphData } from '@/lib/graph-utils'
import type { D3Node, D3Link } from '../types'
import { buildTagColorMap, assignNodeColor, calculateNodeOpacity } from '../utils/colors'

export interface SimulationHelpers {
  nodes: D3Node[]
  links: D3Link[]
  simulation: d3.Simulation<D3Node, D3Link>
  maxConnections: number
  tagColorMap: Map<string, number>
}

/**
 * Hook to create and manage D3 force simulation
 */
export function useGraphSimulation(
  graphData: GraphData,
  dimensions: { width: number; height: number },
  onTick: () => void
): SimulationHelpers {
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null)

  // Calculate connection counts
  const connectionCounts = useMemo(() => {
    const counts = new Map<string, number>()
    graphData.nodes.forEach((node) => counts.set(node.id, 0))
    graphData.edges.forEach((edge) => {
      counts.set(edge.from, (counts.get(edge.from) || 0) + 1)
      counts.set(edge.to, (counts.get(edge.to) || 0) + 1)
    })
    return counts
  }, [graphData])

  // Build tag color map
  const tagColorMap = useMemo(() => {
    const tempNodes = graphData.nodes.map((node) => ({
      ...node,
      connections: 0,
    })) as D3Node[]
    return buildTagColorMap(tempNodes)
  }, [graphData.nodes])

  // Prepare nodes with visual properties
  const nodes: D3Node[] = useMemo(() => {
    const maxConnections = Math.max(...Array.from(connectionCounts.values()), 1)

    return graphData.nodes.map((node) => {
      const connections = connectionCounts.get(node.id) || 0
      const d3Node: D3Node = {
        id: node.id,
        label: node.label,
        title: node.title,
        tags: node.tags,
        slug: node.slug,
        connections,
        color: undefined, // Will be assigned
        opacity: calculateNodeOpacity(connections, maxConnections),
        visible: true,
        alpha: 0, // For entrance animation
      }

      // Assign color
      d3Node.color = assignNodeColor(d3Node, tagColorMap)

      return d3Node
    })
  }, [graphData.nodes, connectionCounts, tagColorMap])

  // Prepare links
  const links: D3Link[] = useMemo(() => {
    return graphData.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      value: edge.value,
      title: edge.title,
    }))
  }, [graphData.edges])

  const maxConnections = useMemo(() => {
    return Math.max(...Array.from(connectionCounts.values()), 1)
  }, [connectionCounts])

  // Create and manage simulation
  useEffect(() => {
    const { width, height } = dimensions

    // Create force simulation with optimized parameters
    const simulation = d3
      .forceSimulation<D3Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => d.id)
          .distance(40)
          .strength(0.8)
      )
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force('collision', d3.forceCollide().radius(8).strength(0.5))
      .alphaDecay(0.02)
      .velocityDecay(0.4)

    simulation.on('tick', onTick)

    simulationRef.current = simulation

    return () => {
      simulation.stop()
    }
  }, [nodes, links, dimensions, onTick])

  return {
    nodes,
    links,
    simulation: simulationRef.current!,
    maxConnections,
    tagColorMap,
  }
}
