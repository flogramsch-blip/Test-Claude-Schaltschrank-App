import type { ZaehlerFeld } from '@/types/zaehlerschrank'
import { useZaehlerStore } from '@/store/zaehlerStore'
import ReiheRenderer from './ReiheRenderer'
import { feldOriginX, feldHeight, reiheOffsetY, FELD_OUTER_W, FELD_INNER_W, FELD_PADDING, FELD_HEADER } from './zaehlerGeometry'

interface Props {
  feld: ZaehlerFeld
  index: number
  canRemove: boolean
}

export default function FeldRenderer({ feld, index, canRemove }: Props) {
  const removeFeld = useZaehlerStore(s => s.removeFeld)
  const originX = feldOriginX(index)
  const height = feldHeight(feld)

  return (
    <g>
      {/* Schatten + Rahmen (heller Zählerschrank) */}
      <rect x={originX + 3} y={3} width={FELD_OUTER_W} height={height} rx={4} fill="#0f172a11" />
      <rect x={originX} y={0} width={FELD_OUTER_W} height={height} rx={4} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.5} />

      {/* Kopfzeile */}
      <rect x={originX} y={0} width={FELD_OUTER_W} height={FELD_HEADER} rx={4} fill="#e2e8f0" />
      <text x={originX + FELD_OUTER_W / 2} y={FELD_HEADER - 7} textAnchor="middle" fontSize={11} fill="#334155" fontFamily="monospace" fontWeight="bold">
        Feld {index + 1}
      </text>

      {/* Feld entfernen */}
      {canRemove && (
        <g onPointerDown={e => { e.stopPropagation(); removeFeld(feld.id) }} style={{ cursor: 'pointer' }}>
          <circle cx={originX + FELD_OUTER_W - 11} cy={11} r={7} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
          <text x={originX + FELD_OUTER_W - 11} y={14} textAnchor="middle" fontSize={10} fill="#64748b">🗑</text>
        </g>
      )}

      {/* Reihen */}
      {feld.reihen.map(reihe => (
        <ReiheRenderer
          key={reihe.id}
          feld={feld}
          reihe={reihe}
          x={originX + FELD_PADDING}
          y={reiheOffsetY(feld, reihe.id)}
          width={FELD_INNER_W}
        />
      ))}
    </g>
  )
}
