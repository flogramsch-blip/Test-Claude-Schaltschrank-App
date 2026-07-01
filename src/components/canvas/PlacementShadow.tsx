import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { TE_WIDTH_PX, RAIL_X_OFFSET, RAIL_TOP_OFFSET_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

/**
 * Schattenmodell: zeigt während des Ziehens (aus der Bibliothek oder beim
 * Verschieben) an, wo das Bauteil landen wird. Grün = gültig, Rot = ungültig
 * (Kollision oder außerhalb der Schiene).
 */
export default function PlacementShadow() {
  const preview = useUIStore(s => s.placementPreview)
  const rails = useSchaltschrankStore(s => s.schaltschrank.rails)

  if (!preview) return null
  const rail = rails.find(r => r.id === preview.railId)
  if (!rail) return null

  const x = RAIL_X_OFFSET + preview.tePosition * TE_WIDTH_PX
  const y = rail.yPosition + RAIL_TOP_OFFSET_PX
  const w = preview.teWidth * TE_WIDTH_PX
  const color = preview.valid ? '#22c55e' : '#ef4444'

  return (
    <g pointerEvents="none">
      <rect
        x={x}
        y={y}
        width={w}
        height={RAIL_HEIGHT_PX}
        rx={2}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="5 3"
      />
      {/* TE-Breite bzw. Fehlermarker in der Mitte */}
      <text
        x={x + w / 2}
        y={y + RAIL_HEIGHT_PX / 2 + 3}
        textAnchor="middle"
        fontSize={9}
        fill={color}
        fontFamily="monospace"
        fontWeight="bold"
      >
        {preview.valid ? `${preview.teWidth} TE` : '✕ belegt'}
      </text>
    </g>
  )
}
