import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useControlState } from '@/simulation/useControlState'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

const SWITCH_TYPES = new Set(['button', 'selector', 'emergency-stop'])

/**
 * Externe Steuereinheit / Bedienfeld: zeigt alle Befehls- und Meldegeräte
 * des Schaltschranks als Front-HMI. In der Simulation lassen sich Taster
 * betätigen und die Meldeleuchten reagieren live.
 */
export default function ControlPanelDialog() {
  const open = useUIStore(s => s.controlPanelOpen)
  const toggle = useUIStore(s => s.toggleControlPanel)
  const simulationRunning = useUIStore(s => s.simulationRunning)
  const pressedButtons = useUIStore(s => s.pressedButtons)
  const toggleButton = useUIStore(s => s.toggleButton)
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const controlState = useControlState(schaltschrank)

  if (!open) return null

  const all = schaltschrank.rails.flatMap(r => r.placedComponents)
  const switches = all.filter(c => SWITCH_TYPES.has(COMPONENT_MAP.get(c.definitionId)?.electricalModel.type ?? ''))
  const lamps = all.filter(c => COMPONENT_MAP.get(c.definitionId)?.electricalModel.type === 'indicator')

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: '#000000aa' }} onClick={toggle}>
      <div
        className="rounded-xl shadow-2xl flex flex-col"
        style={{ background: '#1e293b', border: '2px solid #334155', width: 560, maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Kopf – Bedienfeld-Optik */}
        <div className="flex items-center justify-between px-4 py-3 rounded-t-xl" style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
          <div>
            <div className="text-sm font-bold text-slate-100">🎛 Externe Steuereinheit</div>
            <div className="text-xs text-slate-500">Bedienfeld – Befehls- und Meldegeräte</div>
          </div>
          <button onClick={toggle} className="text-slate-400 hover:text-slate-200 text-xl leading-none">×</button>
        </div>

        <div className="p-5 overflow-y-auto">
          {!simulationRunning && (
            <div className="mb-4 text-xs text-amber-400 text-center py-2 rounded" style={{ background: '#78350f55' }}>
              ▶ Starte die Simulation, damit das Bedienfeld reagiert.
            </div>
          )}

          {switches.length === 0 && lamps.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-8">
              Noch keine Befehls- oder Meldegeräte platziert.<br />
              Setze Taster, Wahlschalter oder Meldeleuchten auf die Hutschienen.
            </div>
          ) : (
            <>
              {/* Meldeleuchten */}
              {lamps.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Meldeleuchten</div>
                  <div className="flex flex-wrap gap-4">
                    {lamps.map(c => {
                      const def = COMPONENT_MAP.get(c.definitionId)!
                      const lit = controlState?.litLamps.has(c.instanceId) ?? false
                      return (
                        <div key={c.instanceId} className="flex flex-col items-center gap-1" style={{ width: 64 }}>
                          <div
                            className="rounded-full"
                            style={{
                              width: 34, height: 34,
                              background: lit ? def.color : '#0f172a',
                              border: `3px solid ${def.color}`,
                              boxShadow: lit ? `0 0 16px ${def.color}` : 'none',
                              transition: 'all 0.15s',
                            }}
                          />
                          <span className="text-xs font-mono text-slate-300">{c.settings.label || def.shortName}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Befehlsgeräte */}
              {switches.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Befehlsgeräte</div>
                  <div className="flex flex-wrap gap-4">
                    {switches.map(c => {
                      const def = COMPONENT_MAP.get(c.definitionId)!
                      const pressed = pressedButtons.has(c.instanceId)
                      const isEmergency = def.electricalModel.type === 'emergency-stop'
                      return (
                        <button
                          key={c.instanceId}
                          disabled={!simulationRunning}
                          onClick={() => toggleButton(c.instanceId)}
                          className="flex flex-col items-center gap-1 disabled:opacity-50"
                          style={{ width: 72 }}
                        >
                          <div
                            className="rounded-full flex items-center justify-center"
                            style={{
                              width: isEmergency ? 46 : 40,
                              height: isEmergency ? 46 : 40,
                              background: isEmergency ? '#dc2626' : def.color,
                              border: pressed ? '3px solid #22c55e' : '3px solid #0f172a',
                              boxShadow: pressed ? '0 0 12px #22c55e' : 'inset 0 -3px 6px #00000060',
                              transition: 'all 0.1s',
                              cursor: simulationRunning ? 'pointer' : 'not-allowed',
                            }}
                          >
                            {isEmergency && <span style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>STOP</span>}
                          </div>
                          <span className="text-xs font-mono text-slate-300">{c.settings.label || def.shortName}</span>
                          <span className="text-xs text-slate-600">{pressed ? 'betätigt' : 'aus'}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
