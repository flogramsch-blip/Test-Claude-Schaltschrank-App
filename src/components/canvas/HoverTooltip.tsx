import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore, findPlacedComponent } from '@/store/schaltschrankStore'
import { COMPONENT_MAP, CATEGORIES } from '@/data/componentDefinitions'

const TRIP_CURVE_INFO: Record<string, string> = {
  B: 'B (3–5×In)',
  C: 'C (5–10×In)',
  D: 'D (10–20×In)',
  gG: 'gG (Ganzbereich)',
  'thermal-magnetic': 'thermisch/magnetisch',
}

export default function HoverTooltip() {
  const hover = useUIStore(s => s.hover)
  const rails = useSchaltschrankStore(s => s.schaltschrank.rails)

  if (!hover.instanceId) return null

  const found = findPlacedComponent(rails, hover.instanceId)
  if (!found) return null
  const { component: placed } = found
  const def = COMPONENT_MAP.get(placed.definitionId)
  if (!def) return null

  const category = CATEGORIES.find(c => c.id === def.category)?.label ?? def.category
  const em = def.electricalModel
  const nominal = placed.settings.nominalCurrent ?? em.nominalCurrentDefault
  const tripCurve = placed.settings.tripCurve ?? em.tripCurve

  // Tooltip rechts-unter dem Cursor, mit Rand-Klemmung
  const margin = 16
  const width = 240
  const left = Math.min(hover.x + margin, window.innerWidth - width - 8)
  const top = Math.min(hover.y + margin, window.innerHeight - 180)

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        width,
        zIndex: 60,
        pointerEvents: 'none',
        background: '#0f172af2',
        border: `1px solid ${def.color}`,
        borderRadius: 6,
        padding: '8px 10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        color: '#e2e8f0',
        fontSize: 12,
      }}
    >
      {/* Kopf */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: def.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700 }}>{def.name}</span>
      </div>

      {/* Bezeichnung falls gesetzt */}
      {placed.settings.label && (
        <div style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700, marginBottom: 4 }}>
          {placed.settings.label}
        </div>
      )}

      {/* Kennwerte */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px', fontSize: 11 }}>
        <span style={{ color: '#64748b' }}>Kategorie</span>
        <span>{category}</span>

        <span style={{ color: '#64748b' }}>Breite</span>
        <span>{def.teWidth} TE ({def.teWidth * 18} mm)</span>

        {em.poleCount > 0 && (
          <>
            <span style={{ color: '#64748b' }}>Pole</span>
            <span>{em.poleCount}-polig</span>
          </>
        )}

        {em.nominalCurrentOptions && (
          <>
            <span style={{ color: '#64748b' }}>Nennstrom</span>
            <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{nominal} A</span>
          </>
        )}

        {tripCurve && (
          <>
            <span style={{ color: '#64748b' }}>Kennlinie</span>
            <span>{TRIP_CURVE_INFO[tripCurve] ?? tripCurve}</span>
          </>
        )}

        {em.type === 'rcd' && (
          <>
            <span style={{ color: '#64748b' }}>Fehlerstrom</span>
            <span>{placed.settings.residualCurrent ?? em.residualCurrentDefault} mA</span>
          </>
        )}

        {em.breakingCapacity && (
          <>
            <span style={{ color: '#64748b' }}>Schaltverm.</span>
            <span>{em.breakingCapacity} kA</span>
          </>
        )}
      </div>

      {/* Kurzbeschreibung */}
      <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #1e293b', color: '#94a3b8', fontSize: 11, lineHeight: 1.4 }}>
        {def.description.length > 130 ? def.description.slice(0, 130) + '…' : def.description}
      </div>
    </div>
  )
}
