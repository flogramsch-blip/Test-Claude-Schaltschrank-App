import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
  pressed?: boolean
}

export default function ButtonRenderer({ def, pressed = false }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const cx = w / 2
  const cy = h / 2
  const isEmergency = def.electricalModel.type === 'emergency-stop'
  const isSelector = def.electricalModel.type === 'selector'

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={1} fill="#0f172a" />

      {/* Betätigt-Ring (Simulation) */}
      {pressed && (
        <rect x={1} y={1} width={w - 2} height={h - 2} rx={2} fill="none" stroke="#22c55e" strokeWidth={2} />
      )}

      {/* Yellow back-plate for emergency stop */}
      {isEmergency && (
        <rect x={3} y={3} width={w - 6} height={h - 6} rx={2} fill="#facc15" />
      )}

      {/* Actuator */}
      {isSelector ? (
        <g>
          {/* Rotary knob */}
          <circle cx={cx} cy={cy} r={9} fill="#334155" stroke="#0ea5e9" strokeWidth={1.5} />
          <line x1={cx} y1={cy} x2={cx + 6} y2={cy - 6} stroke="#e2e8f0" strokeWidth={2} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          {/* Push button (mushroom for emergency) */}
          <circle cx={cx} cy={cy} r={isEmergency ? 11 : 9} fill={def.color} stroke="#0f172a" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={isEmergency ? 7 : 5.5} fill={def.color} stroke="#00000040" strokeWidth={1} />
          {isEmergency && (
            <circle cx={cx} cy={cy} r={3.5} fill="none" stroke="#7f1d1d" strokeWidth={1} />
          )}
        </g>
      )}

      {/* Label */}
      <text
        x={cx}
        y={h - 3}
        textAnchor="middle"
        fontSize={isEmergency ? 4.5 : 5}
        fill={isEmergency ? '#7f1d1d' : '#94a3b8'}
        fontFamily="monospace"
        fontWeight="bold"
      >
        {def.shortName}
      </text>
    </g>
  )
}
