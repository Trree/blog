import { forwardRef, useEffect, useRef, type RefObject } from 'react'

export interface CanvasLayersRef {
  edgesCanvas: HTMLCanvasElement | null
  nodesCanvas: HTMLCanvasElement | null
  labelsCanvas: HTMLCanvasElement | null
  edgesCtx: CanvasRenderingContext2D | null
  nodesCtx: CanvasRenderingContext2D | null
  labelsCtx: CanvasRenderingContext2D | null
}

interface CanvasLayersProps {
  width: number
  height: number
  className?: string
  onMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>) => void
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void
  onDoubleClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void
  onMouseDown?: (event: React.MouseEvent<HTMLCanvasElement>) => void
  onMouseUp?: (event: React.MouseEvent<HTMLCanvasElement>) => void
}

/**
 * Three-layer canvas system for efficient rendering
 * - Bottom: Edges (static after simulation)
 * - Middle: Nodes (updates on interaction)
 * - Top: Labels (updates on zoom/interaction)
 */
const CanvasLayers = forwardRef<CanvasLayersRef, CanvasLayersProps>(
  (
    { width, height, className = '', onMouseMove, onClick, onDoubleClick, onMouseDown, onMouseUp },
    ref
  ) => {
    const edgesCanvasRef = useRef<HTMLCanvasElement>(null)
    const nodesCanvasRef = useRef<HTMLCanvasElement>(null)
    const labelsCanvasRef = useRef<HTMLCanvasElement>(null)

    // Expose canvas refs and contexts to parent
    useEffect(() => {
      if (typeof ref === 'function') {
        ref({
          edgesCanvas: edgesCanvasRef.current,
          nodesCanvas: nodesCanvasRef.current,
          labelsCanvas: labelsCanvasRef.current,
          edgesCtx: edgesCanvasRef.current?.getContext('2d') || null,
          nodesCtx: nodesCanvasRef.current?.getContext('2d') || null,
          labelsCtx: labelsCanvasRef.current?.getContext('2d') || null,
        })
      } else if (ref) {
        ;(ref as React.MutableRefObject<CanvasLayersRef>).current = {
          edgesCanvas: edgesCanvasRef.current,
          nodesCanvas: nodesCanvasRef.current,
          labelsCanvas: labelsCanvasRef.current,
          edgesCtx: edgesCanvasRef.current?.getContext('2d') || null,
          nodesCtx: nodesCanvasRef.current?.getContext('2d') || null,
          labelsCtx: labelsCanvasRef.current?.getContext('2d') || null,
        }
      }
    }, [ref])

    const canvasStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }} className={className}>
        {/* Edges layer (bottom) */}
        <canvas
          ref={edgesCanvasRef}
          width={width}
          height={height}
          style={{ ...canvasStyle, zIndex: 1 }}
        />

        {/* Nodes layer (middle) */}
        <canvas
          ref={nodesCanvasRef}
          width={width}
          height={height}
          style={{ ...canvasStyle, zIndex: 2 }}
        />

        {/* Labels layer (top) - also handles all mouse events */}
        <canvas
          ref={labelsCanvasRef}
          width={width}
          height={height}
          style={{ ...canvasStyle, zIndex: 3 }}
          onMouseMove={onMouseMove}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        />
      </div>
    )
  }
)

CanvasLayers.displayName = 'CanvasLayers'

export default CanvasLayers
