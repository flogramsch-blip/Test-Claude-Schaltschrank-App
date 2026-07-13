import { useRef, useState } from 'react'
import { useZaehlerStore } from '@/store/zaehlerStore'
import FeldRenderer from './FeldRenderer'
import { feldOriginX, feldHeight, FELD_GAP } from './zaehlerGeometry'

export default function ZaehlerCanvas() {
  const projekt = useZaehlerStore(s => s.projekt)
  const addFeld = useZaehlerStore(s => s.addFeld)
  const setSelected = useZaehlerStore(s => s.setSelected)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 40 })
  const svgRef = useRef<SVGSVGElement>(null)
  const panStart = useRef<{ x: number; y: number } | null>(null)

  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    setZoom(z => Math.max(0.3, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))))
  }
  function md(e: React.MouseEvent) { if (e.button === 1 || e.button === 2) panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y } }
  function mm(e: React.MouseEvent) { if (panStart.current) setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y }) }
  function mu(e: React.MouseEvent) { if (e.button === 1 || e.button === 2) panStart.current = null }

  const felder = projekt.felder
  const maxH = Math.max(...felder.map(feldHeight), 200)
  const plusX = feldOriginX(felder.length) - FELD_GAP / 2 - 4
  const plusY = maxH / 2

  return (
    <div className="relative flex-1 overflow-hidden" style={{ background: '#e2e8f0' }} onContextMenu={e => e.preventDefault()}>
      <svg
        ref={svgRef}
        id="zaehler-svg"
        width="100%"
        height="100%"
        onWheel={onWheel}
        onMouseDown={md}
        onMouseMove={mm}
        onMouseUp={mu}
        onClick={() => setSelected(null)}
        style={{ cursor: 'default' }}
      >
        <defs>
          <pattern id="z-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#e5e9ef" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="2" />
          </pattern>
          <pattern id="z-hatch-meter" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#f8fafc" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#e2e8f0" strokeWidth="1.5" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {felder.map((feld, i) => (
            <FeldRenderer key={feld.id} feld={feld} index={i} canRemove={felder.length > 1} />
          ))}

          {/* Feld hinzufügen */}
          <g onClick={e => { e.stopPropagation(); addFeld() }} style={{ cursor: 'pointer' }}>
            <circle cx={plusX} cy={plusY} r={16} fill="#fff" stroke="#2563eb" strokeWidth={1.5} />
            <line x1={plusX - 7} y1={plusY} x2={plusX + 7} y2={plusY} stroke="#2563eb" strokeWidth={2} />
            <line x1={plusX} y1={plusY - 7} x2={plusX} y2={plusY + 7} stroke="#2563eb" strokeWidth={2} />
            <text x={plusX} y={plusY + 30} textAnchor="middle" fontSize={9} fill="#2563eb" fontFamily="monospace">Feld</text>
          </g>
        </g>
      </svg>

      <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded" style={{ background: '#ffffffcc', color: '#64748b', border: '1px solid #cbd5e1' }}>
        Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}

export { }
