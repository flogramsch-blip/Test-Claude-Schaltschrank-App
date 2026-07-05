import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { VOLTAGE_LEVELS } from '@/utils/voltageLevels'

/**
 * Abfrage der Spannungsebene direkt nach dem Verbinden zweier Bauteile.
 * Die Auswahl wird in die Leitung übernommen und rechts in der Info-Box
 * angezeigt; in der Simulation färbt sie die Leitung ein.
 */
export default function VoltagePromptModal() {
  const wireId = useUIStore(s => s.voltagePromptWireId)
  const close = useUIStore(s => s.closeVoltagePrompt)
  const lastVoltage = useUIStore(s => s.lastVoltage)
  const setLastVoltage = useUIStore(s => s.setLastVoltage)
  const updateWire = useSchaltschrankStore(s => s.updateWire)
  const [custom, setCustom] = useState('')

  if (!wireId) return null

  function apply(voltage: string) {
    if (!wireId) return
    if (voltage) { updateWire(wireId, { voltage }); setLastVoltage(voltage) }
    close()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: '#0008' }}
      onClick={() => close()}
    >
      <div
        className="rounded-lg shadow-2xl p-4"
        style={{ background: '#0f172a', border: '1px solid #334155', width: 340 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-sm font-bold text-slate-100 mb-1">Spannungsebene der Leitung</div>
        <div className="text-xs text-slate-500 mb-3">Welche Spannung liegt an dieser Verbindung an?</div>

        <div className="grid grid-cols-2 gap-1.5">
          {VOLTAGE_LEVELS.map(v => (
            <button
              key={v.id}
              onClick={() => apply(v.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-left transition-colors hover:brightness-125"
              style={{
                background: '#1e293b',
                border: '1px solid ' + (lastVoltage === v.id ? v.color : '#334155'),
                color: '#e2e8f0',
              }}
            >
              <span className="inline-block rounded-full shrink-0" style={{ width: 12, height: 12, background: v.color }} />
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && custom.trim()) apply(custom.trim()) }}
            placeholder="Eigene Angabe, z. B. 48 V DC"
            className="flex-1 min-w-0 bg-slate-800 text-slate-100 text-xs px-2 py-1.5 rounded border border-slate-700 outline-none focus:border-blue-500"
          />
          <button
            onClick={() => custom.trim() && apply(custom.trim())}
            className="px-2.5 py-1.5 text-xs rounded font-semibold shrink-0"
            style={{ background: '#1d4ed8', color: '#dbeafe' }}
          >
            OK
          </button>
        </div>

        <button
          onClick={() => close()}
          className="w-full mt-2 py-1.5 text-xs rounded text-slate-400 hover:bg-slate-800"
        >
          Überspringen (keine Angabe)
        </button>
      </div>
    </div>
  )
}
