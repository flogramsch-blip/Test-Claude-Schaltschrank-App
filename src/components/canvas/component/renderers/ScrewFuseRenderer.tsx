import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
  tripped?: boolean
}

// Farbcodierung DIAZED/NEOZED-Kennmelder nach Nennstrom (Auswahl)
const KENN_COLOR: Record<number, string> = {
  6: '#16a34a', 10: '#dc2626', 16: '#6b7280', 20: '#1d4ed8', 25: '#eab308',
  35: '#000000', 50: '#ffffff', 63: '#a16207',
}

export default function ScrewFuseRenderer({ def, placed, tripped }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const poles = def.electricalModel.poleCount
  const poleW = w / poles
  const nominal = placed.settings.nominalCurrent ?? def.electricalModel.nominalCurrentDefault
  const kenn = KENN_COLOR[nominal] ?? '#9ca3af'

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />
      {Array.from({ length: poles }).map((_, i) => {
        const cx = i * poleW + poleW / 2
        return (
          <g key={i}>
            {/* Sicherungssockel */}
            <rect x={i * poleW + 2} y={2} width={poleW - 4} height={h - 4} rx={1} fill="#334155" />
            {/* Schraubkappe (Porzellan) */}
            <circle cx={cx} cy={h / 2} r={Math.min(poleW / 2 - 3, 8)} fill={tripped ? '#7f1d1d' : '#e5e7eb'} stroke="#9ca3af" strokeWidth={1} />
            {/* Kennmelder farbig */}
            <circle cx={cx} cy={h / 2} r={2.5} fill={tripped ? '#374151' : kenn} stroke="#111827" strokeWidth={0.5} />
          </g>
        )
      })}
      <text x={w / 2} y={h + 12} textAnchor="middle" fontSize={7} fill="#64748b" fontFamily="monospace">
        {nominal}A
      </text>
      {tripped && (
        <text x={w / 2} y={h / 2 + 3} textAnchor="middle" fontSize={5} fill="#ef4444" fontWeight="bold" fontFamily="monospace">
          DEFEKT
        </text>
      )}
    </g>
  )
}
