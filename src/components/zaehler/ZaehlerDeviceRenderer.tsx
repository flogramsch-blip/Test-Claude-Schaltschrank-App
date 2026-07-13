import { useDraggable } from '@dnd-kit/core'
import { ZAEHLER_COMPONENT_MAP } from '@/data/zaehlerComponents'
import { useZaehlerStore } from '@/store/zaehlerStore'

interface Props {
  instanceId: string
  definitionId: string
  x: number       // linke obere Ecke (Canvas-Koordinaten)
  y: number
  w: number
  h: number
  isMeter?: boolean
}

/** Helles Gerät im Zählerschrank-Look (weiß, farbiger Akzent). */
export default function ZaehlerDeviceRenderer({ instanceId, definitionId, x, y, w, h, isMeter }: Props) {
  const def = ZAEHLER_COMPONENT_MAP.get(definitionId)
  const selected = useZaehlerStore(s => s.selectedInstanceId === instanceId)
  const setSelected = useZaehlerStore(s => s.setSelected)
  const removeDevice = useZaehlerStore(s => s.removeDevice)
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `zdev-${instanceId}`,
    data: { instanceId, definitionId },
  })
  if (!def) return null

  return (
    <g
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      {...listeners}
      {...attributes}
      transform={`translate(${x}, ${y})`}
      opacity={isDragging ? 0.4 : 1}
      style={{ cursor: 'grab' }}
      onClick={e => { e.stopPropagation(); setSelected(instanceId) }}
    >
      {isMeter ? (
        <g>
          {/* Zählergehäuse */}
          <rect x={0} y={0} width={w} height={h} rx={6} fill="#f8fafc" stroke={selected ? '#f59e0b' : '#64748b'} strokeWidth={selected ? 2.5 : 1.5} />
          <rect x={0} y={0} width={w} height={16} rx={6} fill={def.color} />
          <text x={w / 2} y={11.5} textAnchor="middle" fontSize={9} fill="#f8fafc" fontFamily="monospace" fontWeight="bold">{def.shortName}</text>
          {/* Rundinstrument / Display */}
          <circle cx={w / 2} cy={h * 0.44} r={Math.min(w, h) * 0.26} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
          <rect x={w * 0.24} y={h * 0.66} width={w * 0.52} height={16} rx={2} fill="#0f172a" />
          <text x={w / 2} y={h * 0.66 + 11.5} textAnchor="middle" fontSize={8} fill="#38bdf8" fontFamily="monospace">kWh</text>
          <text x={w / 2} y={h - 8} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="monospace">Zähler</text>
        </g>
      ) : (
        <g>
          <rect x={0} y={0} width={w} height={h} rx={3} fill="#f8fafc" stroke={selected ? '#f59e0b' : '#94a3b8'} strokeWidth={selected ? 2.2 : 1.2} />
          {/* Farbakzent oben */}
          <rect x={0} y={0} width={w} height={5} rx={2} fill={def.color} />
          {/* Kipphebel-Andeutung */}
          <rect x={w / 2 - 3} y={h * 0.4} width={6} height={h * 0.28} rx={1.5} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.6} />
          <text x={w / 2} y={h - 6} textAnchor="middle" fontSize={7} fill="#475569" fontFamily="monospace" fontWeight="bold">{def.shortName}</text>
        </g>
      )}

      {/* Löschen bei Auswahl */}
      {selected && (
        <g
          onPointerDown={e => { e.stopPropagation(); removeDevice(instanceId) }}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={w} cy={0} r={7} fill="#dc2626" stroke="#fff" strokeWidth={1} />
          <text x={w} y={2.5} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="bold">×</text>
        </g>
      )}
    </g>
  )
}
