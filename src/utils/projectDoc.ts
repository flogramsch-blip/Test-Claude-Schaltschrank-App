import type { Schaltschrank, Wire, PlacedComponent } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { buildBOM } from './bom'
import { buildPinPlan } from './pinPlan'
import { buildOperandList } from './operandList'
import { analyzeSchaltschrank } from './validation'

const COLOR_NAMES: Record<string, string> = {
  brown: 'braun', black: 'schwarz', grey: 'grau', blue: 'blau',
  'green-yellow': 'grün-gelb', red: 'rot', orange: 'orange', purple: 'violett', white: 'weiß',
}

function esc(x: string): string {
  return (x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

/** Bezeichnung eines Leitungsendes (Schiene, Frontplatte oder Übergabefeld). */
function endpointLabel(s: Schaltschrank, instanceId: string, connectionId: string): string {
  if (s.interfacePanel && instanceId === s.interfacePanel.id) {
    const pin = parseInt(connectionId.replace('p', ''), 10)
    return `${s.interfacePanel.label}:Pin ${Number.isNaN(pin) ? connectionId : pin + 1}`
  }
  const comp = [...s.rails.flatMap(r => r.placedComponents), ...(s.panelComponents ?? [])]
    .find(c => c.instanceId === instanceId)
  if (comp) {
    const def = COMPONENT_MAP.get(comp.definitionId)
    const term = def?.connections.find(cc => cc.id === connectionId)?.label ?? connectionId
    return `${comp.settings.label || def?.shortName || '?'}:${term}`
  }
  return connectionId
}

function wireRow(s: Schaltschrank, w: Wire, nr: number): string {
  const color = COLOR_NAMES[w.color] ?? w.color
  const cs = w.crossSection ? `${w.crossSection} mm²` : '–'
  return `<tr>
    <td style="text-align:center">${nr}</td>
    <td style="font-family:monospace">${esc(endpointLabel(s, w.fromInstanceId, w.fromConnectionId))}</td>
    <td style="font-family:monospace">${esc(endpointLabel(s, w.toInstanceId, w.toConnectionId))}</td>
    <td>${esc(color)}</td>
    <td style="text-align:center">${cs}</td>
    <td>${esc(w.label ?? '')}</td>
  </tr>`
}

type PlcRef = { instanceId: string; definitionId: string; settings: PlacedComponent['settings'] }

function collectPlcs(s: Schaltschrank): PlcRef[] {
  return [...s.rails.flatMap(r => r.placedComponents), ...(s.panelComponents ?? [])]
    .filter(c => COMPONENT_MAP.get(c.definitionId)?.electricalModel.type === 'plc')
}

function plcEquations(plc: PlcRef): string {
  const def = COMPONENT_MAP.get(plc.definitionId)
  const logic = plc.settings.plcLogic ?? {}
  if (!def || !Object.keys(logic).length) return ''
  const short = (id: string) => def.connections.find(c => c.id === id)?.label ?? id
  const rows = def.connections.filter(c => c.type === 'output').map(out => {
    const rungs = logic[out.id]
    const rhs = rungs && rungs.length
      ? rungs.map(r => r.map(t => (t.negated ? '/' : '') + short(t.ref)).join('·')).join(' + ')
      : '—'
    return `<tr><td style="font-family:monospace;font-weight:bold">${esc(out.label)}</td><td style="font-family:monospace">${esc(rhs)}</td></tr>`
  }).join('')
  return `<table style="margin-top:6px">
    <thead><tr><th style="width:70px">Ausgang</th><th>Verknüpfung ( · =UND · + =ODER · / =NICHT )</th></tr></thead>
    <tbody>${rows}</tbody></table>`
}

/**
 * Erstellt die vollständige Projektdokumentation als druckbares Dokument:
 * Deckblatt, Stückliste, Leitungs-/Aderliste, Klemmenplan, SPS-Operanden &
 * -Verknüpfungen sowie ein Prüfprotokoll.
 */
export function printProjectDoc(s: Schaltschrank, studentName = '') {
  const now = new Date()
  const dateStr = now.toLocaleDateString('de-DE') + ' ' + now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

  const { entries, totalTE, totalCount } = buildBOM(s)
  const bomRows = entries.map(e => `<tr>
    <td>${esc(e.name)}${e.labels.length ? `<br><span style="color:#6b7280;font-size:11px">${esc(e.labels.join(', '))}</span>` : ''}</td>
    <td style="text-align:center">${e.count}</td>
    <td style="text-align:center">${e.teEach} TE</td>
    <td style="text-align:center">${e.teTotal} TE</td>
    <td>${esc(e.currents)}</td>
  </tr>`).join('')

  const wireRows = s.wires.map((w, i) => wireRow(s, w, i + 1)).join('')

  // SPS-Abschnitt
  const plcs = collectPlcs(s)
  const plcSection = plcs.length ? plcs.map(plc => {
    const def = COMPONENT_MAP.get(plc.definitionId)
    const rows = buildOperandList(s, plc).map(r => `<tr${r.connectedTo === '–' ? ' style="color:#9ca3af"' : ''}>
      <td style="font-family:monospace;font-weight:bold">${esc(r.operand)}</td>
      <td>${r.kind}</td>
      <td style="font-family:monospace">${esc(r.symbol) || '–'}</td>
      <td>${esc(r.connectedTo)}</td>
    </tr>`).join('')
    return `<h3 style="margin:14px 0 4px">${esc(plc.settings.label || def?.shortName || 'SPS')} — ${esc(def?.name ?? '')}</h3>
    <table><thead><tr><th style="width:64px">Operand</th><th style="width:72px">Typ</th><th>Symbol. Name</th><th>Angeschlossen an</th></tr></thead>
    <tbody>${rows}</tbody></table>
    ${plcEquations(plc)}`
  }).join('') : '<div class="note">Keine SPS im Projekt.</div>'

  // Klemmenplan (nur wenn Übergabefeld vorhanden)
  let pinPlanSection = '<div class="note">Kein Übergabefeld im Projekt.</div>'
  if (s.interfacePanel) {
    const plan = buildPinPlan(s, s.interfacePanel)
    const used = plan.filter(e => e.interior.length || e.exterior.length).length
    const rows = plan.map(e => `<tr${e.interior.length || e.exterior.length ? '' : ' style="color:#9ca3af"'}>
      <td style="text-align:center;font-weight:bold">${e.pin}</td>
      <td>${e.interior.map(esc).join('<br>') || '–'}</td>
      <td>${e.exterior.map(esc).join('<br>') || '–'}</td>
    </tr>`).join('')
    pinPlanSection = `<div class="note">Übergabefeld ${esc(s.interfacePanel.label)} · ${s.interfacePanel.system === 'harting' ? 'Harting-Steckverbinder' : 'Reihenklemmenblock'} · ${s.interfacePanel.pinCount} Pins (${used} belegt)</div>
    <table><thead><tr><th style="width:44px">Pin</th><th>Innen (Schaltschrank)</th><th>Außen (Bedienfeld)</th></tr></thead>
    <tbody>${rows}</tbody></table>`
  }

  // Prüfprotokoll
  const issues = analyzeSchaltschrank(s)
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')
  const checkSection = issues.length
    ? `<ul style="margin:6px 0 0 16px;padding:0">${issues.map(i =>
        `<li style="color:${i.severity === 'error' ? '#991b1b' : '#92400e'}">${i.severity === 'error' ? '✗' : '⚠'} ${esc(i.message)}</li>`).join('')}</ul>`
    : `<div style="color:#166534;font-weight:600">✓ Keine Fehler oder Warnungen — Aufbau normgerecht.</div>`

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
  <title>Projektdokumentation — ${esc(s.name)}</title>
  <style>
    body{font-family:system-ui,sans-serif;color:#111827;max-width:860px;margin:24px auto;padding:0 20px}
    h1{font-size:24px;margin:0 0 2px}
    h2{font-size:16px;margin:26px 0 6px;padding-bottom:4px;border-bottom:2px solid #e5e7eb}
    .cover{margin-bottom:8px}
    .sub{color:#6b7280;font-size:13px}
    .meta{display:flex;gap:28px;margin:12px 0 4px;font-size:14px;flex-wrap:wrap}
    .note{color:#6b7280;font-size:12px;margin-bottom:6px}
    table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:4px}
    th,td{border:1px solid #d1d5db;padding:5px 8px;vertical-align:top}
    th{background:#f3f4f6;text-align:left}
    .footer{margin-top:28px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
    @media print{body{margin:0}h2{page-break-after:avoid}table{page-break-inside:auto}tr{page-break-inside:avoid}}
  </style></head><body>
    <div class="cover">
      <h1>Projektdokumentation</h1>
      <div class="sub">${esc(s.name)}${s.description ? ' — ' + esc(s.description) : ''}</div>
    </div>
    <div class="meta">
      <div><strong>Name:</strong> ${esc(studentName || '—')}</div>
      <div><strong>Datum:</strong> ${esc(dateStr)}</div>
      <div><strong>Bauteile:</strong> ${totalCount} (${totalTE} TE)</div>
      <div><strong>Leitungen:</strong> ${s.wires.length}</div>
    </div>

    <h2>1 · Stückliste</h2>
    <table>
      <thead><tr><th>Bauteil / Betriebsmittel</th><th style="width:52px">Anz.</th><th style="width:64px">TE/St.</th><th style="width:64px">TE ges.</th><th style="width:120px">Nennstrom</th></tr></thead>
      <tbody>${bomRows || '<tr><td colspan="5" style="color:#9ca3af">Keine Bauteile platziert.</td></tr>'}</tbody>
      <tfoot><tr style="font-weight:bold;background:#f9fafb"><td>Summe</td><td style="text-align:center">${totalCount}</td><td></td><td style="text-align:center">${totalTE} TE</td><td></td></tr></tfoot>
    </table>

    <h2>2 · Leitungs- / Aderliste</h2>
    <table>
      <thead><tr><th style="width:36px">Nr</th><th>Von</th><th>Nach</th><th style="width:80px">Farbe</th><th style="width:70px">Querschn.</th><th style="width:90px">Bezeichnung</th></tr></thead>
      <tbody>${wireRows || '<tr><td colspan="6" style="color:#9ca3af">Keine Leitungen verlegt.</td></tr>'}</tbody>
    </table>

    <h2>3 · SPS-Programmierung (Operanden &amp; Verknüpfungen)</h2>
    ${plcSection}

    <h2>4 · Klemmenplan</h2>
    ${pinPlanSection}

    <h2>5 · Prüfprotokoll</h2>
    <div class="note">${errors.length} Fehler · ${warnings.length} Warnungen</div>
    ${checkSection}

    <div class="footer">Erstellt mit dem Schaltschrank-Simulator · ${esc(dateStr)}</div>
    <script>window.onload=()=>{window.print()}</script>
  </body></html>`

  const w = window.open('', '_blank')
  if (!w) { alert('Bitte Pop-ups für den Druck erlauben.'); return }
  w.document.write(html)
  w.document.close()
}
