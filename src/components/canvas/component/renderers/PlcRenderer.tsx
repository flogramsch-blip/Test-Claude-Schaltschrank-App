import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
  activeIO?: Set<string>   // connectionIds mit Signal (Eingang energisiert / Ausgang aktiv)
}

/** SPS / Logikmodul (LOGO!, S7-1200, S7-1500) im Siemens-Look */
export default function PlcRenderer({ def, activeIO }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const isLogo = def.id === 'logo8'
  const inputs = def.connections.filter(c => c.relativeY === 0)
  const outputs = def.connections.filter(c => c.relativeY === 1)

  return (
    <g>
      {/* Gehäuse */}
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#334155" />
      <rect x={1.5} y={1.5} width={w - 3} height={h - 3} rx={1.5} fill="#3f4a5c" />

      {/* Klemmleisten oben/unten */}
      <rect x={2} y={2} width={w - 4} height={6} fill="#1f2937" />
      <rect x={2} y={h - 8} width={w - 4} height={6} fill="#1f2937" />
      {inputs.map(cp => (
        <rect key={cp.id} x={cp.relativeX * TE_WIDTH_PX - 1.2} y={3} width={2.4} height={4} fill="#94a3b8" />
      ))}
      {outputs.map(cp => (
        <rect key={cp.id} x={cp.relativeX * TE_WIDTH_PX - 1.2} y={h - 7} width={2.4} height={4} fill="#94a3b8" />
      ))}

      {/* Aktive Ein-/Ausgänge während der Simulation (grüne Status-LED) */}
      {activeIO && inputs.filter(cp => activeIO.has(cp.id)).map(cp => (
        <circle key={'li' + cp.id} cx={cp.relativeX * TE_WIDTH_PX} cy={5} r={1.8} fill="#22c55e" stroke="#bbf7d0" strokeWidth={0.4} />
      ))}
      {activeIO && outputs.filter(cp => activeIO.has(cp.id)).map(cp => (
        <circle key={'lo' + cp.id} cx={cp.relativeX * TE_WIDTH_PX} cy={h - 5} r={1.8} fill="#22c55e" stroke="#bbf7d0" strokeWidth={0.4} />
      ))}

      {/* Markenband */}
      <rect x={4} y={10} width={w - 8} height={7} rx={1} fill={def.color} />
      <text x={w / 2} y={15.5} textAnchor="middle" fontSize={5.5} fill="#ecfdf5" fontFamily="monospace" fontWeight="bold">
        {isLogo ? 'LOGO!' : def.shortName}
      </text>

      {/* Display / Status-LEDs */}
      {isLogo ? (
        <g>
          <rect x={w / 2 - 12} y={20} width={24} height={12} rx={1} fill="#0f172a" stroke="#0d9488" strokeWidth={0.8} />
          <text x={w / 2} y={28} textAnchor="middle" fontSize={4.5} fill="#5eead4" fontFamily="monospace">RUN</text>
        </g>
      ) : (
        <g>
          {['RUN', 'ERR', 'MAINT'].map((lbl, i) => (
            <g key={lbl}>
              <circle cx={8} cy={22 + i * 5} r={1.6} fill={i === 0 ? '#22c55e' : '#374151'} />
              <text x={12} y={23.5 + i * 5} fontSize={3.8} fill="#94a3b8" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
          {/* kleines Display bei S7-1500 */}
          {def.id === 's7-1500' && (
            <rect x={w - 30} y={20} width={24} height={14} rx={1} fill="#0f172a" stroke="#115e59" strokeWidth={0.8} />
          )}
        </g>
      )}

      {/* Byte-Gruppen-Beschriftung (I0 / I1 / Q0 / Q1) */}
      {!isLogo && (
        <>
          {[...new Set(inputs.map(c => c.label.split('.')[0]))].map(g => {
            const first = inputs.find(c => c.label.startsWith(g + '.'))!
            return (
              <text key={g} x={first.relativeX * TE_WIDTH_PX} y={-1.5} fontSize={4} fill="#64748b" fontFamily="monospace">{g}</text>
            )
          })}
          {[...new Set(outputs.map(c => c.label.split('.')[0]))].map(g => {
            const first = outputs.find(c => c.label.startsWith(g + '.'))!
            return (
              <text key={g} x={first.relativeX * TE_WIDTH_PX} y={h + 8} fontSize={4} fill="#64748b" fontFamily="monospace">{g}</text>
            )
          })}
        </>
      )}

      <text x={w / 2} y={h + 12} textAnchor="middle" fontSize={7} fill="#64748b" fontFamily="monospace">
        {inputs.length} DI / {outputs.length} DQ
      </text>
    </g>
  )
}
