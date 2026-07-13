import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { ComponentDefinition } from '@/types/components'
import { ZAEHLER_CATEGORIES, ZAEHLER_COMPONENT_MAP, METER_DEVICE_IDS } from '@/data/zaehlerComponents'

function ZaehlerPaletteItem({ def }: { def: ComponentDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `zpalette-${def.id}`,
    data: { definitionId: def.id },
  })
  const isMeter = METER_DEVICE_IDS.has(def.id)
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2 rounded cursor-grab active:cursor-grabbing select-none"
      style={{ background: isDragging ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', opacity: isDragging ? 0.5 : 1 }}
      title={def.description}
    >
      <div className="shrink-0 rounded" style={{ width: 8, height: 30, background: def.color }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-800 truncate">{def.shortName}</div>
        <div className="text-xs text-slate-500 truncate">{def.name}</div>
      </div>
      <div className="shrink-0 font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: isMeter ? '#334155' : '#f97316', color: '#fff', fontSize: 9 }}>
        {isMeter ? 'Zählerpl.' : `${def.teWidth} TE`}
      </div>
    </div>
  )
}

export default function ZaehlerPalette() {
  const [search, setSearch] = useState('')
  const q = search.trim().toLowerCase()

  return (
    <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: 240, background: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
      <div className="p-3 border-b" style={{ borderColor: '#e2e8f0' }}>
        <div className="text-xs font-bold text-slate-700 uppercase tracking-widest">Bauteile</div>
        <div className="text-xs text-slate-500 mb-2">In die Reihen ziehen</div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Suchen…"
          className="w-full text-xs px-2 py-1.5 rounded border outline-none"
          style={{ background: '#fff', borderColor: '#cbd5e1', color: '#334155' }}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
        {ZAEHLER_CATEGORIES.map(cat => {
          const defs = cat.ids
            .map(id => ZAEHLER_COMPONENT_MAP.get(id))
            .filter((d): d is ComponentDefinition => !!d)
            .filter(d => !q || d.name.toLowerCase().includes(q) || d.shortName.toLowerCase().includes(q))
          if (defs.length === 0) return null
          return (
            <div key={cat.id}>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 px-1">{cat.label}</div>
              <div className="flex flex-col gap-1">
                {defs.map(def => <ZaehlerPaletteItem key={def.id} def={def} />)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
