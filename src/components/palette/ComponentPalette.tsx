import { useState } from 'react'
import { COMPONENT_DEFINITIONS, CATEGORIES } from '@/data/componentDefinitions'
import PaletteItem from './PaletteItem'

export default function ComponentPalette() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  function toggle(catId: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  const sorted = [...CATEGORIES].sort((a, b) => a.order - b.order)

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: '#0f172a', borderRight: '1px solid #1e293b', width: 240 }}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-slate-800">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Bauteile</div>
        <div className="text-xs text-slate-600 mt-0.5">Auf Hutschiene ziehen</div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto py-2">
        {sorted.map(cat => {
          const items = COMPONENT_DEFINITIONS.filter(d => d.category === cat.id)
          const isOpen = !collapsed.has(cat.id)
          return (
            <div key={cat.id} className="mb-1">
              <button
                className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-800 transition-colors"
                onClick={() => toggle(cat.id)}
              >
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{cat.label}</span>
                <span className="text-slate-600 text-xs">{isOpen ? '▾' : '▸'}</span>
              </button>
              {isOpen && (
                <div className="px-2 pb-1 flex flex-col gap-1">
                  {items.map(def => <PaletteItem key={def.id} def={def} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-slate-800">
        <div className="text-xs text-slate-600">
          🔵 1 TE = 18mm
        </div>
      </div>
    </div>
  )
}
