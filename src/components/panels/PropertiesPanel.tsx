import { useSchaltschrankStore, findAnyComponent } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import type { ComponentSimState } from '@/types/simulation'
import { WIRE_COLORS } from '@/utils/teGrid'
import { WIRE_COLOR_OPTIONS } from '../canvas/wiring/WireColorPicker'
import type { WireColor } from '@/types/components'
import InterfacePanelConfig from './InterfacePanelConfig'
import PlcLogicEditor from './PlcLogicEditor'
import { printOperandList } from '@/utils/operandList'
import { VOLTAGE_LEVELS, voltageColor } from '@/utils/voltageLevels'

interface Props {
  simState: { componentStates: Map<string, ComponentSimState> } | null
}

export default function PropertiesPanel({ simState }: Props) {
  const selectedInstanceId = useUIStore(s => s.selectedInstanceId)
  const selectedWireId = useUIStore(s => s.selectedWireId)
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const updateComponentSettings = useSchaltschrankStore(s => s.updateComponentSettings)
  const removeComponent = useSchaltschrankStore(s => s.removeComponent)
  const removeWire = useSchaltschrankStore(s => s.removeWire)
  const updateWire = useSchaltschrankStore(s => s.updateWire)

  const selectedWire = schaltschrank.wires.find(w => w.id === selectedWireId)

  // Übergabefeld ausgewählt → eigene Konfiguration
  const iface = schaltschrank.interfacePanel
  if (iface && selectedInstanceId === iface.id) {
    return <InterfacePanelConfig />
  }

  if (selectedInstanceId) {
    const found = findAnyComponent(schaltschrank, selectedInstanceId)
    if (!found) return <EmptyPanel />
    const { component: placed } = found
    const def = COMPONENT_MAP.get(placed.definitionId)
    if (!def) return <EmptyPanel />
    const cs = simState?.componentStates.get(placed.instanceId)

    return (
      <div className="h-full flex flex-col overflow-hidden" style={{ background: '#0f172a', borderLeft: '1px solid #1e293b', width: 260 }}>
        <div className="px-3 py-3 border-b border-slate-800">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Eigenschaften</div>
          <div className="text-sm text-slate-100 mt-1 font-semibold">{def.name}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          {/* Designation */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Bezeichnung (z.B. Q1, F1)</span>
            <input
              type="text"
              value={placed.settings.label ?? ''}
              onChange={e => updateComponentSettings(placed.instanceId, { label: e.target.value })}
              className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700 outline-none focus:border-blue-500"
              placeholder={def.shortName}
            />
          </label>

          {/* Nominal current */}
          {def.electricalModel.nominalCurrentOptions && (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Nennstrom</span>
              <select
                value={placed.settings.nominalCurrent ?? def.electricalModel.nominalCurrentDefault}
                onChange={e => updateComponentSettings(placed.instanceId, { nominalCurrent: Number(e.target.value) })}
                className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700 outline-none focus:border-blue-500"
              >
                {def.electricalModel.nominalCurrentOptions.map(a => (
                  <option key={a} value={a}>{a} A</option>
                ))}
              </select>
            </label>
          )}

          {/* Trip curve */}
          {def.electricalModel.tripCurve && def.electricalModel.type === 'breaker' && (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Auslösekennlinie</span>
              <select
                value={placed.settings.tripCurve ?? def.electricalModel.tripCurve}
                onChange={e => updateComponentSettings(placed.instanceId, { tripCurve: e.target.value })}
                className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
              >
                <option value="B">B (3-5×In, Licht)</option>
                <option value="C">C (5-10×In, Allgemein)</option>
                <option value="D">D (10-20×In, Motoren)</option>
              </select>
            </label>
          )}

          {/* Residual current for RCDs */}
          {def.electricalModel.type === 'rcd' && (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Auslösestrom (Fehlerstrom)</span>
              <select
                value={placed.settings.residualCurrent ?? def.electricalModel.residualCurrentDefault}
                onChange={e => updateComponentSettings(placed.instanceId, { residualCurrent: Number(e.target.value) })}
                className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
              >
                <option value={10}>10 mA (hochsensibel)</option>
                <option value={30}>30 mA (Personenschutz)</option>
                <option value={100}>100 mA</option>
                <option value={300}>300 mA (Brandschutz)</option>
              </select>
            </label>
          )}

          {/* Netzteil / Spannungsquelle */}
          {(def.electricalModel.type === 'power-supply' || def.electricalModel.type === 'transformer') && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Ausgangsspannung</span>
                <select
                  value={placed.settings.voltage ?? (def.electricalModel.type === 'power-supply' ? 24 : 24)}
                  onChange={e => updateComponentSettings(placed.instanceId, { voltage: Number(e.target.value) })}
                  className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
                >
                  {[5, 12, 24, 48, 110, 230, 400].map(v => <option key={v} value={v}>{v} V</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Spannungsart</span>
                <select
                  value={placed.settings.voltageType ?? 'DC'}
                  onChange={e => updateComponentSettings(placed.instanceId, { voltageType: e.target.value })}
                  className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
                >
                  <option value="DC">DC (Gleichspannung)</option>
                  <option value="AC">AC (Wechselspannung)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Ausgangsstrom (max.)</span>
                <select
                  value={placed.settings.outputCurrent ?? placed.settings.nominalCurrent ?? def.electricalModel.nominalCurrentDefault}
                  onChange={e => updateComponentSettings(placed.instanceId, { outputCurrent: Number(e.target.value) })}
                  className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
                >
                  {[1, 2.5, 5, 10, 20, 40].map(a => <option key={a} value={a}>{a} A</option>)}
                </select>
              </label>
            </>
          )}

          {/* Zeitrelais */}
          {def.id.startsWith('zeitrelais') && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Funktion</span>
                <select
                  value={placed.settings.timerMode ?? def.electricalModel.timerModeDefault ?? 'on-delay'}
                  onChange={e => updateComponentSettings(placed.instanceId, { timerMode: e.target.value })}
                  className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
                >
                  <option value="on-delay">anzugverzögert (Ansprechverzögerung)</option>
                  <option value="off-delay">abfallverzögert (Rückfallverzögerung)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Verzögerungszeit</span>
                <select
                  value={placed.settings.timerSeconds ?? 5}
                  onChange={e => updateComponentSettings(placed.instanceId, { timerSeconds: Number(e.target.value) })}
                  className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
                >
                  {[0.5, 1, 2, 3, 5, 10, 15, 30, 60].map(t => <option key={t} value={t}>{t} s</option>)}
                </select>
              </label>
            </>
          )}

          {/* Reihenklemme: Spannungsebene */}
          {def.electricalModel.type === 'terminal' && def.id !== 'pe-klemme' && (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Spannungsebene (Farbmarkierung)</span>
              <select
                value={placed.settings.terminalLevel ?? 'none'}
                onChange={e => updateComponentSettings(placed.instanceId, { terminalLevel: e.target.value })}
                className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
              >
                <option value="none">grau (unbestimmt)</option>
                <option value="L">L – Phase (grau/schwarz)</option>
                <option value="N">N – Neutralleiter (blau)</option>
                <option value="PE">PE – Schutzleiter (grün-gelb)</option>
                <option value="24VDC">24V DC + (rot)</option>
                <option value="0V">0V / GND (weiß/blau)</option>
              </select>
            </label>
          )}

          {/* Simulation state */}
          {cs && (
            <div className="border border-slate-700 rounded p-2">
              <div className="text-xs text-slate-400 mb-2 font-semibold">Simulationszustand</div>
              {cs.tripped ? (
                <div className="text-xs text-red-400 font-bold">{cs.tripReason}</div>
              ) : (
                <div className="flex flex-col gap-1 text-xs font-mono">
                  {cs.currentL1 > 0 && <div className="text-slate-300">L1: <span className="text-amber-400">{cs.currentL1.toFixed(1)} A</span></div>}
                  {cs.currentL2 > 0 && <div className="text-slate-300">L2: <span className="text-amber-400">{cs.currentL2.toFixed(1)} A</span></div>}
                  {cs.currentL3 > 0 && <div className="text-slate-300">L3: <span className="text-amber-400">{cs.currentL3.toFixed(1)} A</span></div>}
                  <div className="text-slate-300">P: <span className="text-green-400">{cs.powerDissipation.toFixed(2)} W</span></div>
                </div>
              )}
            </div>
          )}

          {/* SPS: Ein-/Ausgänge benennen + Operandenliste */}
          {def.electricalModel.type === 'plc' && (
            <div className="border border-slate-700 rounded p-2">
              <div className="text-xs font-semibold text-slate-400 mb-2">Ein-/Ausgänge (Operanden)</div>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                {def.connections.map(cp => (
                  <div key={cp.id} className="flex items-center gap-1.5">
                    <span className="shrink-0 font-mono text-xs" style={{ width: 42, color: cp.type === 'input' ? '#38bdf8' : '#fbbf24' }}>{cp.label}</span>
                    <input
                      value={placed.settings.ioNames?.[cp.id] ?? ''}
                      onChange={e => updateComponentSettings(placed.instanceId, {
                        ioNames: { ...(placed.settings.ioNames ?? {}), [cp.id]: e.target.value },
                      })}
                      placeholder="symbol. Name"
                      className="flex-1 min-w-0 bg-slate-800 text-slate-100 text-xs px-1.5 py-1 rounded border border-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => printOperandList(schaltschrank, placed)}
                className="w-full mt-2 py-1.5 text-xs rounded font-semibold"
                style={{ background: '#1d4ed8', color: '#dbeafe' }}
              >
                🖨 Operandenliste drucken
              </button>
            </div>
          )}

          {/* SPS: Verknüpfungslogik (Ladder/FUP) */}
          {def.electricalModel.type === 'plc' && (
            <PlcLogicEditor
              def={def}
              placed={placed}
              onChange={plcLogic => updateComponentSettings(placed.instanceId, { plcLogic })}
            />
          )}

          {/* Description */}
          <div className="border border-slate-800 rounded p-2">
            <div className="text-xs text-slate-400 mb-1 font-semibold">Info</div>
            <p className="text-xs text-slate-500 leading-relaxed">{def.description}</p>
          </div>

          {/* Delete */}
          <button
            onClick={() => removeComponent(placed.instanceId)}
            className="mt-auto w-full py-2 text-sm rounded font-semibold transition-colors"
            style={{ background: '#7f1d1d', color: '#fca5a5' }}
          >
            Bauteil entfernen
          </button>
        </div>
      </div>
    )
  }

  if (selectedWire && selectedWireId) {
    return (
      <div className="h-full flex flex-col overflow-hidden" style={{ background: '#0f172a', borderLeft: '1px solid #1e293b', width: 260 }}>
        <div className="px-3 py-3 border-b border-slate-800">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Leitung</div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          {/* Color */}
          <label className="flex flex-col gap-2">
            <span className="text-xs text-slate-400">Leitungsfarbe</span>
            <div className="flex flex-wrap gap-1.5">
              {WIRE_COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  title={opt.label}
                  onClick={() => updateWire(selectedWireId, { color: opt.value as WireColor })}
                  className="rounded transition-transform hover:scale-110"
                  style={{
                    width: 24, height: 24,
                    background: WIRE_COLORS[opt.value],
                    border: selectedWire.color === opt.value ? '2px solid #f59e0b' : '2px solid #374151',
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">{WIRE_COLOR_OPTIONS.find(o => o.value === selectedWire.color)?.label}</span>
          </label>

          {/* Cross section */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Querschnitt</span>
            <select
              value={selectedWire.crossSection ?? 1.5}
              onChange={e => updateWire(selectedWireId, { crossSection: Number(e.target.value) })}
              className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
            >
              {[0.75, 1.0, 1.5, 2.5, 4.0, 6.0, 10.0, 16.0].map(s => (
                <option key={s} value={s}>{s} mm²</option>
              ))}
            </select>
          </label>

          {/* Label */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Bezeichnung</span>
            <input
              type="text"
              value={selectedWire.label ?? ''}
              onChange={e => updateWire(selectedWireId, { label: e.target.value })}
              className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700 outline-none focus:border-blue-500"
              placeholder="z.B. L1, N, PE, 24V+"
            />
          </label>

          {/* Spannungsebene */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Spannungsebene</span>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full shrink-0" style={{ width: 14, height: 14, background: voltageColor(selectedWire.voltage) ?? '#334155', border: '1px solid #475569' }} />
              <select
                value={VOLTAGE_LEVELS.some(v => v.id === selectedWire.voltage) ? selectedWire.voltage : (selectedWire.voltage ? '__custom' : '')}
                onChange={e => { if (e.target.value !== '__custom') updateWire(selectedWireId, { voltage: e.target.value || undefined }) }}
                className="flex-1 min-w-0 bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
              >
                <option value="">— keine Angabe —</option>
                {VOLTAGE_LEVELS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                {selectedWire.voltage && !VOLTAGE_LEVELS.some(v => v.id === selectedWire.voltage) && (
                  <option value="__custom">{selectedWire.voltage} (eigen)</option>
                )}
              </select>
            </div>
            <input
              type="text"
              value={selectedWire.voltage ?? ''}
              onChange={e => updateWire(selectedWireId, { voltage: e.target.value || undefined })}
              className="bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700 outline-none focus:border-blue-500"
              placeholder="oder eigene Angabe, z.B. 48 V DC"
            />
            <span className="text-xs text-slate-600">Färbt die Leitung in der Simulation.</span>
          </label>

          {/* Durchführung (nur bei flächenübergreifenden Leitungen) */}
          {(() => {
            const panelIds = new Set((schaltschrank.panelComponents ?? []).map(p => p.instanceId))
            const crossSurface = panelIds.has(selectedWire.fromInstanceId) !== panelIds.has(selectedWire.toInstanceId)
            if (!crossSurface) return null
            return (
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Durchführung (Außen ↔ Innen)</span>
                <select
                  value={selectedWire.crossing ?? 'harting'}
                  onChange={e => updateWire(selectedWireId, { crossing: e.target.value as 'harting' | 'conduit' | 'terminal' })}
                  className="bg-slate-800 text-slate-100 text-sm px-2 py-1.5 rounded border border-slate-700"
                >
                  <option value="harting">Harting-Steckverbinder</option>
                  <option value="conduit">Kabelschlauch / Wellrohr</option>
                  <option value="terminal">Reihenklemme (Durchgang)</option>
                </select>
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedWire.crossingRotated}
                    onChange={e => updateWire(selectedWireId, { crossingRotated: e.target.checked })}
                  />
                  <span className="text-xs text-slate-400">Verbinder drehen (Seiteneinführung)</span>
                </label>
                <span className="text-xs text-slate-600">Übergabe zwischen Fronttür und Innenausbau</span>
              </label>
            )
          })()}

          <button
            onClick={() => removeWire(selectedWireId)}
            className="mt-auto w-full py-2 text-sm rounded font-semibold"
            style={{ background: '#7f1d1d', color: '#fca5a5' }}
          >
            Leitung entfernen
          </button>
        </div>
      </div>
    )
  }

  return <EmptyPanel />
}

function EmptyPanel() {
  return (
    <div
      className="h-full flex flex-col justify-center items-center gap-2"
      style={{ background: '#0f172a', borderLeft: '1px solid #1e293b', width: 260 }}
    >
      <div className="text-slate-700 text-4xl">⚡</div>
      <div className="text-xs text-slate-600 text-center px-4">
        Bauteil oder Leitung auswählen um Eigenschaften anzuzeigen
      </div>
    </div>
  )
}
