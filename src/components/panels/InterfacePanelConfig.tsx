import { useSchaltschrankStore } from '@/store/schaltschrankStore'

export default function InterfacePanelConfig() {
  const panel = useSchaltschrankStore(s => s.schaltschrank.interfacePanel)
  const update = useSchaltschrankStore(s => s.updateInterfacePanel)
  const remove = useSchaltschrankStore(s => s.removeInterfacePanel)
  if (!panel) return null

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#0f172a', borderLeft: '1px solid #1e293b', width: 260 }}>
      <div className="px-3 py-3 border-b border-slate-800">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Übergabefeld</div>
        <div className="text-sm text-slate-100 mt-1 font-semibold">Wand-Durchführung</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Bezeichnung</span>
          <input
            value={panel.label}
            onChange={e => update({ label: e.target.value })}
            className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700 outline-none focus:border-blue-500"
            placeholder="z. B. X1"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">System</span>
          <select
            value={panel.system}
            onChange={e => update({ system: e.target.value as 'harting' | 'terminal' })}
            className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
          >
            <option value="harting">Harting-Steckverbinder</option>
            <option value="terminal">Reihenklemmenblock</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Anzahl Pins / Klemmen</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => update({ pinCount: panel.pinCount - 1 })}
              className="w-8 h-8 rounded text-slate-300 hover:bg-slate-700 text-lg"
              style={{ background: '#1e293b', border: '1px solid #334155' }}
            >−</button>
            <input
              type="number" min={1} max={48}
              value={panel.pinCount}
              onChange={e => update({ pinCount: Number(e.target.value) })}
              className="w-16 text-center bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
            />
            <button
              onClick={() => update({ pinCount: panel.pinCount + 1 })}
              className="w-8 h-8 rounded text-slate-300 hover:bg-slate-700 text-lg"
              style={{ background: '#1e293b', border: '1px solid #334155' }}
            >+</button>
          </div>
          <span className="text-xs text-slate-600">Pins werden dynamisch angepasst (1–48)</span>
        </label>

        <div className="border border-slate-800 rounded p-2">
          <div className="text-xs text-slate-400 mb-1 font-semibold">Info</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Das Übergabefeld verbindet Innenausbau und Außeneinheit. Schließe im Innenausbau die
            Schrank-Leitungen an die Pins an – auf der Fronttür erscheint das gespiegelte Feld,
            an das die Bedienelemente angeschlossen werden. Jeder Pin überträgt sein Signal
            direkt von innen nach außen.
          </p>
        </div>

        <button
          onClick={remove}
          className="mt-auto w-full py-2 text-sm rounded font-semibold"
          style={{ background: '#7f1d1d', color: '#fca5a5' }}
        >
          Übergabefeld entfernen
        </button>
      </div>
    </div>
  )
}
