import type { ComponentDefinition } from '@/types/components'
import type { PlacedComponent, PlcRung } from '@/types/schaltschrank'

interface Props {
  def: ComponentDefinition
  placed: { settings: PlacedComponent['settings'] }
  onChange: (plcLogic: Record<string, PlcRung[]>) => void
}

/**
 * Kleiner Verknüpfungs-Editor (Ladder/FUP-artig) für SPS-Ausgänge.
 * Jeder Ausgang Q = ODER-verknüpfte Zeilen; jede Zeile = UND-verknüpfte
 * Kontakte (Ein-/Ausgänge, optional als Öffner). Ausgänge dürfen auf sich
 * selbst verweisen → Selbsthaltung. Die Auswertung erfolgt in der Simulation.
 */
export default function PlcLogicEditor({ def, placed, onChange }: Props) {
  const logic: Record<string, PlcRung[]> = placed.settings.plcLogic ?? {}
  const names = placed.settings.ioNames ?? {}
  const inputs = def.connections.filter(c => c.type === 'input')
  const outputs = def.connections.filter(c => c.type === 'output')
  const refs = def.connections  // I + Q als mögliche Kontakte

  const refLabel = (id: string) => {
    const cp = def.connections.find(c => c.id === id)
    const base = cp?.label ?? id
    return names[id] ? `${base} (${names[id]})` : base
  }
  const shortRef = (id: string) => def.connections.find(c => c.id === id)?.label ?? id

  function commit(outId: string, rungs: PlcRung[]) {
    const next = { ...logic }
    // leere Zeilen (ohne Terme) entfernen; ganz leere Ausgänge löschen
    const cleaned = rungs.filter(r => r.length > 0)
    if (cleaned.length) next[outId] = cleaned
    else delete next[outId]
    onChange(next)
  }

  function addRung(outId: string) {
    const rungs = logic[outId] ?? []
    // Standard-Kontakt: erster Eingang
    const firstRef = inputs[0]?.id ?? refs[0].id
    commit(outId, [...rungs, [{ ref: firstRef, negated: false }]])
  }
  function addTerm(outId: string, r: number) {
    const rungs = (logic[outId] ?? []).map(x => [...x])
    const firstRef = inputs[0]?.id ?? refs[0].id
    rungs[r] = [...rungs[r], { ref: firstRef, negated: false }]
    commit(outId, rungs)
  }
  function setTermRef(outId: string, r: number, t: number, ref: string) {
    const rungs = (logic[outId] ?? []).map(x => x.map(y => ({ ...y })))
    rungs[r][t].ref = ref
    commit(outId, rungs)
  }
  function toggleNeg(outId: string, r: number, t: number) {
    const rungs = (logic[outId] ?? []).map(x => x.map(y => ({ ...y })))
    rungs[r][t].negated = !rungs[r][t].negated
    commit(outId, rungs)
  }
  function removeTerm(outId: string, r: number, t: number) {
    const rungs = (logic[outId] ?? []).map(x => x.map(y => ({ ...y })))
    rungs[r].splice(t, 1)
    commit(outId, rungs)
  }

  function equation(outId: string): string {
    const rungs = logic[outId]
    if (!rungs || !rungs.length) return '0 (nicht verknüpft)'
    return rungs.map(r => r.map(t => (t.negated ? '/' : '') + shortRef(t.ref)).join('·')).join('  +  ')
  }

  return (
    <div className="border border-slate-700 rounded p-2">
      <div className="text-xs font-semibold text-slate-400 mb-1">SPS-Verknüpfung (Logik)</div>
      <div className="text-[10px] text-slate-500 mb-2 leading-tight">
        · = UND · + = ODER · <span className="text-amber-400">/</span> = NICHT (Öffner). Zeilen sind ODER-verknüpft.
        Ausgänge dürfen auf sich selbst verweisen (Selbsthaltung).
      </div>

      <div className="flex flex-col gap-3">
        {outputs.map(out => {
          const rungs = logic[out.id] ?? []
          return (
            <div key={out.id} className="rounded border border-slate-800 p-1.5" style={{ background: '#0b1220' }}>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono text-xs font-bold" style={{ color: '#fbbf24' }}>{out.label}</span>
                {names[out.id] && <span className="text-[10px] text-slate-500">({names[out.id]})</span>}
                <span className="text-[10px] text-slate-600">=</span>
                <span className="font-mono text-[11px] text-emerald-400 truncate">{equation(out.id)}</span>
              </div>

              {rungs.map((rung, r) => (
                <div key={r}>
                  {r > 0 && <div className="text-[9px] text-slate-500 my-0.5 pl-1">ODER</div>}
                  <div className="flex flex-wrap items-center gap-1">
                    {rung.map((term, t) => (
                      <div key={t} className="flex items-center rounded overflow-hidden" style={{ border: '1px solid #334155' }}>
                        <button
                          onClick={() => toggleNeg(out.id, r, t)}
                          title="Öffner/Schließer umschalten"
                          className="px-1 text-[11px] font-mono font-bold"
                          style={{ background: term.negated ? '#78350f' : '#1e293b', color: term.negated ? '#fcd34d' : '#475569' }}
                        >
                          {term.negated ? '/' : ' '}
                        </button>
                        <select
                          value={term.ref}
                          onChange={e => setTermRef(out.id, r, t, e.target.value)}
                          className="bg-slate-800 text-slate-100 text-[11px] font-mono px-1 py-0.5 outline-none"
                        >
                          <optgroup label="Eingänge">
                            {inputs.map(cp => <option key={cp.id} value={cp.id}>{refLabel(cp.id)}</option>)}
                          </optgroup>
                          <optgroup label="Ausgänge (Selbsthaltung)">
                            {outputs.map(cp => <option key={cp.id} value={cp.id}>{refLabel(cp.id)}</option>)}
                          </optgroup>
                        </select>
                        <button
                          onClick={() => removeTerm(out.id, r, t)}
                          title="Kontakt entfernen"
                          className="px-1 text-[11px] text-slate-500 hover:text-red-400"
                          style={{ background: '#1e293b' }}
                        >×</button>
                      </div>
                    ))}
                    <button
                      onClick={() => addTerm(out.id, r)}
                      className="px-1.5 py-0.5 text-[10px] rounded text-slate-300"
                      style={{ background: '#1e293b', border: '1px solid #334155' }}
                    >+ UND</button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addRung(out.id)}
                className="mt-1.5 w-full py-1 text-[10px] rounded font-medium text-slate-300"
                style={{ background: '#1e293b', border: '1px solid #334155' }}
              >
                {rungs.length ? '+ ODER-Zeile' : '+ Verknüpfung hinzufügen'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
