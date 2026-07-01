import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export default function StatusBar() {
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const selectedId = useUIStore(s => s.selectedInstanceId)

  const allComps = schaltschrank.rails.flatMap(r => r.placedComponents)
  const usedTE = allComps.reduce((sum, c) => sum + (COMPONENT_MAP.get(c.definitionId)?.teWidth ?? 0), 0)
  const totalTE = schaltschrank.rails.reduce((sum, r) => sum + r.lengthTE, 0)
  const fillPct = totalTE > 0 ? Math.round((usedTE / totalTE) * 100) : 0

  const selected = selectedId ? allComps.find(c => c.instanceId === selectedId) : null
  const selDef = selected ? COMPONENT_MAP.get(selected.definitionId) : null

  return (
    <div
      className="flex items-center gap-4 px-4 shrink-0 text-xs"
      style={{ background: '#0f172a', borderTop: '1px solid #1e293b', height: 26, color: '#64748b' }}
    >
      <span>🔩 {allComps.length} Bauteile</span>
      <span>🔌 {schaltschrank.wires.length} Leitungen</span>
      <span>📏 {schaltschrank.rails.length} Hutschienen</span>
      <span>{usedTE} / {totalTE} TE belegt ({fillPct} %)</span>
      <div className="flex-1" />
      {selDef && selected ? (
        <span className="text-slate-400">
          Ausgewählt: <span className="font-mono text-amber-400">{selected.settings.label || selDef.shortName}</span> · {selDef.name}
        </span>
      ) : (
        <span className="text-slate-600">Nichts ausgewählt</span>
      )}
    </div>
  )
}
