import type { Schaltschrank, PlacedComponent } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export interface OperandRow {
  operand: string        // z. B. I0.0 / Q0.1
  kind: 'Eingang' | 'Ausgang'
  symbol: string         // benutzerdefinierter Name
  connectedTo: string    // was ist angeschlossen
}

function connectedLabel(s: Schaltschrank, plcId: string, connId: string): string {
  for (const w of s.wires) {
    let otherId = '', otherConn = ''
    if (w.fromInstanceId === plcId && w.fromConnectionId === connId) { otherId = w.toInstanceId; otherConn = w.toConnectionId }
    else if (w.toInstanceId === plcId && w.toConnectionId === connId) { otherId = w.fromInstanceId; otherConn = w.fromConnectionId }
    else continue
    if (s.interfacePanel && otherId === s.interfacePanel.id) {
      return `${s.interfacePanel.label}:Pin ${parseInt(otherConn.replace('p', ''), 10) + 1}`
    }
    const comp = [...s.rails.flatMap(r => r.placedComponents), ...(s.panelComponents ?? [])].find(c => c.instanceId === otherId)
    if (comp) {
      const def = COMPONENT_MAP.get(comp.definitionId)
      const term = def?.connections.find(cc => cc.id === otherConn)?.label ?? otherConn
      return `${comp.settings.label || def?.shortName || '?'}:${term}`
    }
  }
  return '–'
}

type PlcRef = { instanceId: string; definitionId: string; settings: PlacedComponent['settings'] }

export function buildOperandList(s: Schaltschrank, plc: PlcRef): OperandRow[] {
  const def = COMPONENT_MAP.get(plc.definitionId)
  if (!def) return []
  const names = plc.settings.ioNames ?? {}
  return def.connections.map(cp => ({
    operand: cp.label,
    kind: cp.type === 'input' ? 'Eingang' : 'Ausgang',
    symbol: names[cp.id] ?? '',
    connectedTo: connectedLabel(s, plc.instanceId, cp.id),
  }))
}

function esc(x: string): string {
  return x.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

export function printOperandList(s: Schaltschrank, plc: PlcRef) {
  const def = COMPONENT_MAP.get(plc.definitionId)
  const rows = buildOperandList(s, plc)
  const now = new Date()
  const dateStr = now.toLocaleDateString('de-DE') + ' ' + now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  const tr = rows.map(r => `
    <tr${r.connectedTo === '–' ? ' style="color:#9ca3af"' : ''}>
      <td style="font-family:monospace;font-weight:bold">${esc(r.operand)}</td>
      <td>${r.kind}</td>
      <td style="font-family:monospace">${esc(r.symbol) || '–'}</td>
      <td>${esc(r.connectedTo)}</td>
    </tr>`).join('')
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
  <title>Operandenliste ${esc(plc.settings.label || def?.shortName || 'SPS')}</title>
  <style>
    body{font-family:system-ui,sans-serif;color:#111827;max-width:820px;margin:24px auto;padding:0 16px}
    h1{font-size:20px;margin:0 0 4px} .sub{color:#6b7280;font-size:13px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{border:1px solid #d1d5db;padding:6px 8px;vertical-align:top}
    th{background:#f3f4f6;text-align:left}
    .footer{margin-top:20px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
    @media print{body{margin:0}}
  </style></head><body>
    <h1>Operandenliste — ${esc(plc.settings.label || def?.shortName || 'SPS')}</h1>
    <div class="sub">${esc(def?.name ?? '')} · ${esc(s.name)} · ${esc(dateStr)}</div>
    <table>
      <thead><tr><th style="width:70px">Operand</th><th style="width:80px">Typ</th><th>Symbol. Name</th><th>Angeschlossen an</th></tr></thead>
      <tbody>${tr}</tbody>
    </table>
    <div class="footer">Erstellt mit dem Schaltschrank-Simulator</div>
    <script>window.onload=()=>{window.print()}</script>
  </body></html>`
  const w = window.open('', '_blank')
  if (!w) { alert('Bitte Pop-ups für den Druck erlauben.'); return }
  w.document.write(html)
  w.document.close()
}
