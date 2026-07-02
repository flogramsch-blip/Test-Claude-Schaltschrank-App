import type { Schaltschrank, InterfacePanel, Wire } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { componentSurface } from './surfaceGeometry'

export interface PinPlanEntry {
  pin: number
  interior: string[]  // Anschlüsse im Schrank, z. B. "K1:A1 (rot, 1,5 mm²)"
  exterior: string[]  // Anschlüsse auf der Außeneinheit
}

const COLOR_NAMES: Record<string, string> = {
  brown: 'braun', black: 'schwarz', grey: 'grau', blue: 'blau',
  'green-yellow': 'grün-gelb', red: 'rot', orange: 'orange', purple: 'violett', white: 'weiß',
}

function endpointLabel(s: Schaltschrank, instanceId: string, connectionId: string): string {
  for (const rail of s.rails) {
    const c = rail.placedComponents.find(c => c.instanceId === instanceId)
    if (c) {
      const def = COMPONENT_MAP.get(c.definitionId)
      const term = def?.connections.find(cc => cc.id === connectionId)?.label ?? connectionId
      return `${c.settings.label || def?.shortName || '?'}:${term}`
    }
  }
  const pc = s.panelComponents?.find(c => c.instanceId === instanceId)
  if (pc) {
    const def = COMPONENT_MAP.get(pc.definitionId)
    const term = def?.connections.find(cc => cc.id === connectionId)?.label ?? connectionId
    return `${pc.settings.label || def?.shortName || '?'}:${term}`
  }
  return '?'
}

function wireDesc(s: Schaltschrank, w: Wire, otherId: string, otherConn: string): string {
  const color = COLOR_NAMES[w.color] ?? w.color
  const cs = w.crossSection ? `, ${w.crossSection} mm²` : ''
  return `${endpointLabel(s, otherId, otherConn)} (${color}${cs})`
}

/** Baut die Pin-Belegung des Übergabefelds aus den angeschlossenen Leitungen. */
export function buildPinPlan(s: Schaltschrank, panel: InterfacePanel): PinPlanEntry[] {
  const entries: PinPlanEntry[] = Array.from({ length: panel.pinCount }, (_, i) => ({
    pin: i + 1, interior: [], exterior: [],
  }))
  for (const w of s.wires) {
    let pinConn: string | null = null
    let otherId = '', otherConn = ''
    if (w.fromInstanceId === panel.id) { pinConn = w.fromConnectionId; otherId = w.toInstanceId; otherConn = w.toConnectionId }
    else if (w.toInstanceId === panel.id) { pinConn = w.toConnectionId; otherId = w.fromInstanceId; otherConn = w.fromConnectionId }
    if (!pinConn) continue
    const idx = parseInt(pinConn.replace('p', ''), 10)
    if (Number.isNaN(idx) || idx >= panel.pinCount) continue
    const surf = componentSurface(s, otherId)
    const desc = wireDesc(s, w, otherId, otherConn)
    if (surf === 'door') entries[idx].exterior.push(desc)
    else entries[idx].interior.push(desc)
  }
  return entries
}

function escapeHtml(x: string): string {
  return x.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

/** Öffnet den Klemmenplan als druckbares Dokument. */
export function printPinPlan(s: Schaltschrank, panel: InterfacePanel) {
  const entries = buildPinPlan(s, panel)
  const used = entries.filter(e => e.interior.length || e.exterior.length).length
  const rows = entries.map(e => `
    <tr${e.interior.length || e.exterior.length ? '' : ' style="color:#9ca3af"'}>
      <td style="text-align:center;font-weight:bold">${e.pin}</td>
      <td>${e.interior.map(escapeHtml).join('<br>') || '–'}</td>
      <td>${e.exterior.map(escapeHtml).join('<br>') || '–'}</td>
    </tr>`).join('')

  const now = new Date()
  const dateStr = now.toLocaleDateString('de-DE') + ' ' + now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
  <title>Klemmenplan ${escapeHtml(panel.label)}</title>
  <style>
    body{font-family:system-ui,sans-serif;color:#111827;max-width:800px;margin:24px auto;padding:0 16px}
    h1{font-size:20px;margin:0 0 4px} .sub{color:#6b7280;font-size:13px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{border:1px solid #d1d5db;padding:6px 8px;vertical-align:top}
    th{background:#f3f4f6;text-align:left}
    .footer{margin-top:20px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
    @media print{body{margin:0}}
  </style></head><body>
    <h1>Klemmenplan — Übergabefeld ${escapeHtml(panel.label)}</h1>
    <div class="sub">
      ${escapeHtml(s.name)} · ${panel.system === 'harting' ? 'Harting-Steckverbinder' : 'Reihenklemmenblock'} ·
      ${panel.pinCount} Pins (${used} belegt) · ${escapeHtml(dateStr)}
    </div>
    <table>
      <thead><tr><th style="width:44px">Pin</th><th>Innen (Schaltschrank)</th><th>Außen (Bedienfeld)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">Erstellt mit dem Schaltschrank-Simulator</div>
    <script>window.onload=()=>{window.print()}</script>
  </body></html>`

  const w = window.open('', '_blank')
  if (!w) { alert('Bitte Pop-ups für den Druck erlauben.'); return }
  w.document.write(html)
  w.document.close()
}
