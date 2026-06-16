import { useRef } from 'react'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import type { EditorMode } from '@/store/uiStore'
import type { SimulationState } from '@/types/simulation'
import SimulationPanel from '../simulation/SimulationPanel'

interface Props {
  simState: SimulationState | null
  setSimState: (s: SimulationState | null) => void
  trippedComponents: Set<string>
  setTrippedComponents: (s: Set<string>) => void
}

const MODES: Array<{ id: EditorMode; label: string; shortcut: string }> = [
  { id: 'select', label: 'Auswahl', shortcut: 'S' },
  { id: 'wire',   label: 'Verdrahten', shortcut: 'W' },
  { id: 'delete', label: 'Löschen', shortcut: 'D' },
]

export default function TopBar({ simState, setSimState, trippedComponents, setTrippedComponents }: Props) {
  const { schaltschrank, undo, redo, past, future, exportJSON, importJSON, addRail, updateProjectName } = useSchaltschrankStore()
  const { mode, setMode, zoom, setZoom } = useUIStore()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${schaltschrank.name.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importJSON(ev.target?.result as string)
      } catch {
        alert('Ungültige Projektdatei')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 shrink-0 flex-wrap"
      style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', minHeight: 52 }}
    >
      {/* Project name */}
      <input
        value={schaltschrank.name}
        onChange={e => updateProjectName(e.target.value)}
        className="bg-transparent text-slate-200 font-semibold text-sm outline-none border-b border-transparent focus:border-slate-600 min-w-0"
        style={{ width: 160 }}
      />

      <div className="w-px h-5 bg-slate-700" />

      {/* Mode buttons */}
      <div className="flex gap-1">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium transition-colors"
            style={{
              background: mode === m.id ? '#1d4ed8' : '#1e293b',
              color: mode === m.id ? '#dbeafe' : '#64748b',
              border: '1px solid',
              borderColor: mode === m.id ? '#2563eb' : '#334155',
            }}
            title={`${m.label} (${m.shortcut})`}
          >
            {m.label}
            <span className="text-slate-600 text-xs ml-0.5">[{m.shortcut}]</span>
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-slate-700" />

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="px-2 py-1 text-xs rounded font-mono disabled:opacity-30 hover:bg-slate-800 text-slate-400"
          title="Rückgängig (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="px-2 py-1 text-xs rounded font-mono disabled:opacity-30 hover:bg-slate-800 text-slate-400"
          title="Wiederholen (Ctrl+Y)"
        >
          ↪
        </button>
      </div>

      <div className="w-px h-5 bg-slate-700" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button onClick={() => setZoom(zoom - 0.1)} className="text-xs px-1.5 py-1 rounded hover:bg-slate-800 text-slate-500">−</button>
        <span className="text-xs font-mono text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom + 0.1)} className="text-xs px-1.5 py-1 rounded hover:bg-slate-800 text-slate-500">+</button>
        <button onClick={() => setZoom(1)} className="text-xs px-1 py-1 rounded hover:bg-slate-800 text-slate-600 ml-1">1:1</button>
      </div>

      <div className="w-px h-5 bg-slate-700" />

      {/* Add rail */}
      <button
        onClick={() => addRail(36)}
        className="text-xs px-2.5 py-1 rounded font-medium transition-colors"
        style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155' }}
      >
        + Hutschiene
      </button>

      <div className="w-px h-5 bg-slate-700" />

      {/* Simulation */}
      <SimulationPanel
        simState={simState}
        setSimState={setSimState}
        trippedComponents={trippedComponents}
        setTrippedComponents={setTrippedComponents}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* File operations */}
      <div className="flex gap-1">
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs px-2.5 py-1 rounded font-medium transition-colors"
          style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155' }}
        >
          Laden
        </button>
        <button
          onClick={handleExport}
          className="text-xs px-2.5 py-1 rounded font-medium transition-colors"
          style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155' }}
        >
          Speichern
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>
    </div>
  )
}
