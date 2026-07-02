import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { buildPinPlan, printPinPlan } from '@/utils/pinPlan'

export default function InterfacePanelConfig() {
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const panel = schaltschrank.interfacePanel
  const update = useSchaltschrankStore(s => s.updateInterfacePanel)
  const remove = useSchaltschrankStore(s => s.removeInterfacePanel)
  if (!panel) return null

  const plan = buildPinPlan(schaltschrank, panel)
  const used = plan.filter(e => e.interior.length || e.exterior.length)

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#0f172a', borderLeft: '1px solid #1e293b', width: 260 }}>
      <div className="px-3 py-3 border-b border-slate-800">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Übergabefeld</div>
        <div className="text-sm text-slate-100 mt-1 font-semibold">Industriestecker / Wand-Durchführung</div>
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
          <span className="text-xs text-slate-400">Ausrichtung</span>
          <select
            value={panel.orientation ?? 'horizontal'}
            onChange={e => update({ orientation: e.target.value as 'horizontal' | 'vertical' })}
            className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
          >
            <option value="vertical">Vertikal (Seitenwand)</option>
            <option value="horizontal">Horizontal</option>
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
          <span className="text-xs text-slate-600">Grafik passt sich automatisch an (1–48)</span>
        </label>

        {/* Pin-Belegung (live) */}
        <div className="border border-slate-700 rounded p-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400">Pin-Belegung</span>
            <span className="text-xs text-slate-600">{used.length} / {panel.pinCount} belegt</span>
          </div>
          {used.length === 0 ? (
            <div className="text-xs text-slate-600">
              Noch keine Pins belegt. Im Verdrahten-Modus (W) Leitungen an die Pins anschließen.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {used.map(e => (
                <div key={e.pin} className="text-xs flex gap-1.5">
                  <span className="shrink-0 font-mono font-bold text-amber-400" style={{ width: 22 }}>{e.pin}</span>
                  <span className="text-slate-400 leading-snug">
                    {e.interior.length > 0 && <>🔧 {e.interior.join(', ')}<br /></>}
                    {e.exterior.length > 0 && <>🚪 {e.exterior.join(', ')}</>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => printPinPlan(schaltschrank, panel)}
          className="w-full py-2 text-sm rounded font-semibold"
          style={{ background: '#1d4ed8', color: '#dbeafe' }}
        >
          🖨 Klemmenplan drucken
        </button>

        <div className="border border-slate-800 rounded p-2">
          <div className="text-xs text-slate-400 mb-1 font-semibold">Info</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Der Industriestecker verbindet Innenausbau und Außeneinheit. Schließe innen die
            Schrank-Leitungen an die Pins an – auf der Fronttür erscheint das gespiegelte Feld
            mit denselben Kontakten. Jeder Pin überträgt sein Signal 1:1 nach außen.
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
