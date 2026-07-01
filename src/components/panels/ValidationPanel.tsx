import { useState } from 'react'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { analyzeSchaltschrank } from '@/utils/validation'

export default function ValidationPanel() {
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const selectComponent = useUIStore(s => s.selectComponent)
  const selectWire = useUIStore(s => s.selectWire)
  const [open, setOpen] = useState(false)

  const issues = analyzeSchaltschrank(schaltschrank)
  const errors = issues.filter(i => i.severity === 'error').length
  const warnings = issues.filter(i => i.severity === 'warning').length
  const clean = issues.length === 0

  return (
    <div className="absolute bottom-3 left-3 z-30" style={{ width: open ? 340 : 'auto' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold shadow-lg"
        style={{
          background: clean ? '#14532d' : errors > 0 ? '#7f1d1d' : '#78350f',
          color: clean ? '#86efac' : errors > 0 ? '#fca5a5' : '#fcd34d',
          border: '1px solid #334155',
        }}
      >
        {clean ? '✓ Prüfung: keine Auffälligkeiten' : `⚠ Prüfung: ${errors > 0 ? `${errors} Fehler` : ''}${errors > 0 && warnings > 0 ? ', ' : ''}${warnings > 0 ? `${warnings} Warnung${warnings > 1 ? 'en' : ''}` : ''}`}
        {!clean && <span className="text-slate-400">{open ? '▾' : '▸'}</span>}
      </button>

      {open && !clean && (
        <div
          className="mt-1 rounded shadow-2xl overflow-y-auto"
          style={{ background: '#0f172a', border: '1px solid #334155', maxHeight: 260 }}
        >
          {issues.map((issue, i) => (
            <button
              key={i}
              onClick={() => {
                if (issue.instanceId) selectComponent(issue.instanceId)
                else if (issue.wireId) selectWire(issue.wireId)
              }}
              className="w-full text-left px-3 py-2 border-b border-slate-800 hover:bg-slate-800 transition-colors flex gap-2"
            >
              <span style={{ color: issue.severity === 'error' ? '#ef4444' : '#f59e0b' }}>
                {issue.severity === 'error' ? '✕' : '⚠'}
              </span>
              <span className="text-xs text-slate-300 leading-snug">{issue.message}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
