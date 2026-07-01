import { useState } from 'react'
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions'
import type { CustomExercise } from '@/data/customExercises'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (ex: CustomExercise) => void
}

export default function CustomExerciseDialog({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState('')
  const [rows, setRows] = useState<Array<{ definitionId: string; count: number }>>([
    { definitionId: COMPONENT_DEFINITIONS[0].id, count: 1 },
  ])
  const [minWires, setMinWires] = useState(0)

  if (!open) return null

  function addRow() {
    setRows(r => [...r, { definitionId: COMPONENT_DEFINITIONS[0].id, count: 1 }])
  }
  function save() {
    if (!title.trim()) { alert('Bitte einen Titel eingeben.'); return }
    onSave({
      id: 'custom-' + title.toLowerCase().replace(/\s+/g, '-') + '-' + rows.length + '-' + minWires,
      title: title.trim(),
      requiredComponents: rows.filter(r => r.count > 0),
      minWires,
    })
    setTitle(''); setRows([{ definitionId: COMPONENT_DEFINITIONS[0].id, count: 1 }]); setMinWires(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center" style={{ background: '#00000099' }} onClick={onClose}>
      <div
        className="rounded-lg shadow-2xl flex flex-col"
        style={{ background: '#0f172a', border: '1px solid #334155', width: 480 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="text-sm font-bold text-slate-200">➕ Eigene Aufgabe erstellen</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Titel der Aufgabe</span>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="z. B. Beleuchtungsstromkreis aufbauen"
              className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700 outline-none focus:border-blue-500"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Benötigte Bauteile</span>
            {rows.map((row, i) => (
              <div key={i} className="flex gap-1.5">
                <select
                  value={row.definitionId}
                  onChange={e => setRows(rs => rs.map((r, j) => j === i ? { ...r, definitionId: e.target.value } : r))}
                  className="flex-1 bg-slate-800 text-slate-100 text-xs px-2 py-1.5 rounded border border-slate-700"
                >
                  {COMPONENT_DEFINITIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <input
                  type="number" min={1} max={20}
                  value={row.count}
                  onChange={e => setRows(rs => rs.map((r, j) => j === i ? { ...r, count: Number(e.target.value) } : r))}
                  className="w-14 bg-slate-800 text-slate-100 text-xs px-2 py-1.5 rounded border border-slate-700"
                />
                {rows.length > 1 && (
                  <button onClick={() => setRows(rs => rs.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400 px-1">×</button>
                )}
              </div>
            ))}
            <button onClick={addRow} className="text-xs text-blue-400 hover:text-blue-300 self-start mt-1">+ Bauteil hinzufügen</button>
          </div>

          <label className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Mindestanzahl Leitungen</span>
            <input
              type="number" min={0} max={50}
              value={minWires}
              onChange={e => setMinWires(Number(e.target.value))}
              className="w-16 bg-slate-800 text-slate-100 text-xs px-2 py-1.5 rounded border border-slate-700"
            />
          </label>
        </div>

        <div className="px-4 py-3 border-t border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="text-xs px-3 py-1.5 rounded" style={{ background: '#1e293b', color: '#94a3b8' }}>Abbrechen</button>
          <button onClick={save} className="text-xs px-3 py-1.5 rounded font-semibold" style={{ background: '#1d4ed8', color: '#dbeafe' }}>Speichern</button>
        </div>
      </div>
    </div>
  )
}
