import type * as d3 from 'd3'

export interface Color {
  light: string
  dark: string
  name: string
}

export interface D3Node extends d3.SimulationNodeDatum {
  id: string
  label: string
  title: string
  tags: string[]
  slug: string
  connections: number
  // Visual properties
  color?: Color
  opacity?: number
  renderRadius?: number
  visible?: boolean
  alpha?: number
}

export interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  value: number
  title: string
}

export interface RenderQueue {
  edges: boolean
  nodes: boolean
  labels: boolean
}

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Particle {
  link: D3Link
  progress: number // 0 to 1
  speed: number
}

export interface SearchState {
  query: string
  matches: D3Node[]
  currentIndex: number
}
