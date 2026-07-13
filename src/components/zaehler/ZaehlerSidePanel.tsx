import { useState } from 'react'
import { useZaehlerStore } from '@/store/zaehlerStore'
import { buildZaehlerBOM } from '@/utils/zaehlerBom'
import { analyzeZaehlerschrank, trafficLight } from '@/utils/zaehlerRules'
import { FELD_TE } from './zaehlerGeometry'
import { ZAEHLER_COMPONENT_MAP } from '@/data/zaehlerComponents'

type Tab = 'stueckliste' | 'info' | 'regeln'

const LIGHT = { rot: '#dc2626', gelb: '#eab308', gruen: '#16a34a' }

export default function ZaehlerSidePanel() {
  const projekt = useZaehlerStore(s => s.projekt)
  const updateProjektInfo = useZaehlerStore(s => s.updateProjektInfo)
  const [tab, setTab] = useState<Tab>('stueckliste')

  const bom = buildZaehlerBOM(projekt)
  const issues = analyzeZaehlerschrank(projekt)
  const light = trafficLight(issues)
  const lightColor = light === 'red' ? LIGHT.rot : light === 'yellow' ? LIGHT.gelb : LIGHT.gruen

  // Statistik
  const verteilerReihen = projekt.felder.flatMap(f => f.reihen.filter(r => r.type === 'verteiler'))
  const usedTE = verteilerReihen.reduce((s, r) => s + r.devices.reduce((t, d) => t + (ZAEHLER_COMPONENT_MAP.get(d.definitionId)?.teWidth ?? 0), 0), 0)
  const freeTE = verteilerReihen.length * FELD_TE - usedTE

  return (
    <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: 300, background: '#f8fafc', borderLeft: '1px solid #cbd5e1' }}>
      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#e2e8f0' }}>
        {([['stueckliste', 'Stückliste'], ['info', 'Projektinfo'], ['regeln', 'Regeln']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 py-2 text-xs font-semibold transition-colors relative"
            style={{ color: tab === id ? '#1d4ed8' : '#64748b', borderBottom: tab === id ? '2px solid #1d4ed8' : '2px solid transparent' }}>
            {label}
            {id === 'regeln' && <span className="inline-block ml-1 rounded-full align-middle" style={{ width: 8, height: 8, background: lightColor }} />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'stueckliste' && (
          <div>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#64748b', textAlign: 'left' }}>
                  <th className="py-1">Bauteil</th>
                  <th className="py-1 text-center">Anz.</th>
                  <th className="py-1 text-center">TE</th>
                </tr>
              </thead>
              <tbody>
                {bom.entries.map(e => (
                  <tr key={e.definitionId} style={{ borderTop: '1px solid #e2e8f0', color: '#334155' }}>
                    <td className="py-1.5">{e.shortName}<div className="text-slate-400" style={{ fontSize: 10 }}>{e.name}</div></td>
                    <td className="py-1.5 text-center font-mono">{e.count}</td>
                    <td className="py-1.5 text-center font-mono">{e.teEach === 0 ? '–' : e.teTotal}</td>
                  </tr>
                ))}
                {bom.entries.length === 0 && (
                  <tr><td colSpan={3} className="py-3 text-slate-400 text-center">Noch keine Bauteile platziert.</td></tr>
                )}
              </tbody>
              {bom.entries.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '2px solid #cbd5e1', color: '#0f172a', fontWeight: 700 }}>
                    <td className="py-1.5">Summe</td>
                    <td className="py-1.5 text-center font-mono">{bom.totalCount}</td>
                    <td className="py-1.5 text-center font-mono">{bom.totalTE}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {tab === 'info' && (
          <div className="flex flex-col gap-3">
            {([['name', 'Projektname'], ['bauherr', 'Bauherr'], ['ort', 'Ort / Anlage']] as const).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">{label}</span>
                <input value={(projekt[key] as string | undefined) ?? ''} onChange={e => updateProjektInfo({ [key]: e.target.value })}
                  className="text-sm px-2 py-1.5 rounded border outline-none" style={{ background: '#fff', borderColor: '#cbd5e1', color: '#334155' }} />
              </label>
            ))}
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Bemerkung</span>
              <textarea value={projekt.bemerkung ?? ''} onChange={e => updateProjektInfo({ bemerkung: e.target.value })} rows={3}
                className="text-sm px-2 py-1.5 rounded border outline-none resize-none" style={{ background: '#fff', borderColor: '#cbd5e1', color: '#334155' }} />
            </label>
            <div className="rounded border p-2 text-xs text-slate-600" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
              <div className="flex justify-between py-0.5"><span>Felder</span><span className="font-mono">{projekt.felder.length}</span></div>
              <div className="flex justify-between py-0.5"><span>Bauteile</span><span className="font-mono">{bom.totalCount}</span></div>
              <div className="flex justify-between py-0.5"><span>Belegte TE (Verteiler)</span><span className="font-mono">{usedTE}</span></div>
              <div className="flex justify-between py-0.5"><span>Freie TE (Verteiler)</span><span className="font-mono">{freeTE}</span></div>
            </div>
          </div>
        )}

        {tab === 'regeln' && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full" style={{ width: 34, height: 34, background: lightColor, boxShadow: `0 0 10px ${lightColor}88` }} />
              <div className="text-sm font-semibold" style={{ color: lightColor }}>
                {light === 'green' ? 'Alle Grundregeln erfüllt' : light === 'yellow' ? 'Hinweise / Empfehlungen' : 'Regelverstoß'}
              </div>
            </div>
            {issues.length === 0 ? (
              <div className="text-xs text-green-700">✓ Keine Beanstandungen – Aufbau entspricht den geprüften Grundregeln.</div>
            ) : (
              <ul className="flex flex-col gap-2">
                {issues.map((iss, i) => (
                  <li key={i} className="text-xs rounded p-2" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: iss.severity === 'error' ? LIGHT.rot : iss.severity === 'warning' ? '#b45309' : '#64748b' }}>
                      {iss.severity === 'error' ? '✗' : iss.severity === 'warning' ? '⚠' : 'ℹ'} {iss.message}
                    </div>
                    {iss.norm && <div className="text-slate-400 mt-0.5" style={{ fontSize: 10 }}>{iss.norm}</div>}
                  </li>
                ))}
              </ul>
            )}
            <div className="text-slate-400 mt-3" style={{ fontSize: 10 }}>
              Vereinfachte Grundregelprüfung (VDE-AR-N 4100 / DIN VDE 0100 / DIN 18015-1). Ersetzt keine normkonforme Planung.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
