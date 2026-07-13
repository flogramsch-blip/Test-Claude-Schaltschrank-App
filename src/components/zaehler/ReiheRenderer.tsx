import { useDroppable } from '@dnd-kit/core'
import type { ZaehlerFeld, ZaehlerReihe, ZaehlerReihenTyp } from '@/types/zaehlerschrank'
import { ZAEHLER_REIHEN_LABELS } from '@/types/zaehlerschrank'
import { ZAEHLER_COMPONENT_MAP, METER_DEVICE_IDS } from '@/data/zaehlerComponents'
import { useZaehlerStore } from '@/store/zaehlerStore'
import { ZTE_PX, FELD_TE, ROW_HEIGHTS, RAIL_Y_IN_ROW } from './zaehlerGeometry'
import ZaehlerDeviceRenderer from './ZaehlerDeviceRenderer'

interface Props {
  feld: ZaehlerFeld
  reihe: ZaehlerReihe
  x: number       // linke Innenkante des Feldes
  y: number       // Oberkante der Reihe (Canvas-Koordinaten)
  width: number   // = FELD_INNER_W
}

const DEVICE_H = 54
const DEVICE_TOP = 20
const TE_ROW_TYPES: ZaehlerReihenTyp[] = ['verteiler', 'anschlussraum-oben', 'anschlussraum-unten']

export default function ReiheRenderer({ feld, reihe, x, y, width }: Props) {
  const setReihenTyp = useZaehlerStore(s => s.setReihenTyp)
  const preview = useZaehlerStore(s => s.preview)
  const h = ROW_HEIGHTS[reihe.type]
  const { setNodeRef } = useDroppable({ id: `zreihe:${feld.id}:${reihe.id}` })
  const isTE = TE_ROW_TYPES.includes(reihe.type)
  const isMeterRow = reihe.type === 'zaehlerplatz'

  const bg =
    reihe.type === 'reserve' ? 'url(#z-hatch)' :
    isMeterRow ? '#eef2f7' :
    '#f1f5f9'

  const showPreview = preview && preview.feldId === feld.id && preview.reiheId === reihe.id

  return (
    <g>
      {/* Reihen-Hintergrund */}
      <rect x={x} y={y} width={width} height={h} fill={bg} stroke="#cbd5e1" strokeWidth={1} />

      {/* Caption */}
      <text x={x + 5} y={y + 12} fontSize={8} fill="#64748b" fontFamily="monospace">{ZAEHLER_REIHEN_LABELS[reihe.type]}</text>

      {/* Reihentyp-Auswahl (oben rechts) */}
      <foreignObject x={x + width - 116} y={y + 2} width={114} height={20}>
        <select
          value={reihe.type}
          onPointerDown={e => e.stopPropagation()}
          onChange={e => {
            const next = e.target.value as ZaehlerReihenTyp
            if (reihe.devices.length && !confirm('Reihentyp ändern? Nicht passende Geräte werden entfernt.')) return
            setReihenTyp(feld.id, reihe.id, next)
          }}
          style={{ width: '100%', fontSize: 9, padding: '1px 2px', border: '1px solid #cbd5e1', borderRadius: 3, background: '#fff', color: '#334155' }}
        >
          {(Object.keys(ZAEHLER_REIHEN_LABELS) as ZaehlerReihenTyp[]).map(t => (
            <option key={t} value={t}>{ZAEHLER_REIHEN_LABELS[t]}</option>
          ))}
        </select>
      </foreignObject>

      {/* TE-Reihe: Hutschiene + Teilungsraster */}
      {isTE && (
        <g>
          <rect x={x} y={y + RAIL_Y_IN_ROW - 4} width={width} height={8} fill="#d1d9e0" stroke="#b6c0cc" strokeWidth={0.6} />
          {Array.from({ length: FELD_TE + 1 }, (_, t) => (
            <line key={t} x1={x + t * ZTE_PX} y1={y + RAIL_Y_IN_ROW - 7} x2={x + t * ZTE_PX} y2={y + RAIL_Y_IN_ROW + 7} stroke="#94a3b8" strokeWidth={0.5} />
          ))}
        </g>
      )}

      {/* Zählerplatz: leerer Steckplatz-Hinweis */}
      {isMeterRow && reihe.devices.length === 0 && (
        <g>
          <rect x={x + width / 2 - 55} y={y + 30} width={110} height={h - 46} rx={6} fill="url(#z-hatch-meter)" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3" />
          <text x={x + width / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="monospace">Zähler hier</text>
        </g>
      )}

      {/* Platzierungs-Vorschau (Schattenmodell) */}
      {showPreview && (
        isMeterRow
          ? <rect x={x + 4} y={y + 24} width={width - 8} height={h - 32} rx={4}
              fill={preview!.valid ? '#22c55e22' : '#ef444422'} stroke={preview!.valid ? '#22c55e' : '#ef4444'} strokeWidth={1.5} strokeDasharray="5 3" />
          : <rect x={x + preview!.tePosition * ZTE_PX} y={y + DEVICE_TOP} width={Math.max(preview!.teWidth, 1) * ZTE_PX} height={DEVICE_H} rx={3}
              fill={preview!.valid ? '#22c55e22' : '#ef444422'} stroke={preview!.valid ? '#22c55e' : '#ef4444'} strokeWidth={1.5} strokeDasharray="5 3" />
      )}

      {/* Geräte */}
      {reihe.devices.map(dev => {
        const def = ZAEHLER_COMPONENT_MAP.get(dev.definitionId)
        if (!def) return null
        if (METER_DEVICE_IDS.has(dev.definitionId)) {
          const mw = 116, mh = h - 40
          return <ZaehlerDeviceRenderer key={dev.instanceId} instanceId={dev.instanceId} definitionId={dev.definitionId}
            x={x + width / 2 - mw / 2} y={y + 26} w={mw} h={mh} isMeter />
        }
        return <ZaehlerDeviceRenderer key={dev.instanceId} instanceId={dev.instanceId} definitionId={dev.definitionId}
          x={x + dev.tePosition * ZTE_PX} y={y + DEVICE_TOP} w={def.teWidth * ZTE_PX} h={DEVICE_H} />
      })}

      {/* Droppable-Fläche (nur Geometrie, pointer-events aus) */}
      <rect ref={setNodeRef as unknown as React.Ref<SVGRectElement>} x={x} y={y} width={width} height={h} fill="transparent" style={{ pointerEvents: 'none' }} />
    </g>
  )
}
