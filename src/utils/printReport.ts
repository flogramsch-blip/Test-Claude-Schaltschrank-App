import type { Evaluation, ExerciseStep } from '@/data/exercises'

export interface ReportExercise {
  nr: number
  title: string
  difficulty: string
  done: boolean
  steps: ExerciseStep[]
}

export function printReport(studentName: string, results: ReportExercise[], evalResult: Evaluation, dateStr: string) {
  const rows = results.map(r => {
    const stepList = r.steps
      .map(s => `<li style="color:${s.done ? '#166534' : '#991b1b'}">${s.done ? '✓' : '✗'} ${escapeHtml(s.label)}</li>`)
      .join('')
    return `
      <tr>
        <td style="text-align:center;font-weight:bold">${r.nr}</td>
        <td>${escapeHtml(r.title)}<ul style="margin:4px 0 0 16px;padding:0;font-size:11px">${stepList}</ul></td>
        <td style="text-align:center">${escapeHtml(r.difficulty)}</td>
        <td style="text-align:center;font-weight:bold;color:${r.done ? '#166534' : '#991b1b'}">${r.done ? 'gelöst' : 'offen'}</td>
      </tr>`
  }).join('')

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
  <title>Auswertung – Schaltschrank-Simulator</title>
  <style>
    body{font-family:system-ui,sans-serif;color:#111827;max-width:800px;margin:24px auto;padding:0 16px}
    h1{font-size:22px;margin:0 0 4px} .sub{color:#6b7280;font-size:13px;margin-bottom:20px}
    .meta{display:flex;gap:32px;margin-bottom:16px;font-size:14px}
    .grade{display:inline-block;padding:8px 16px;border-radius:8px;color:#fff;font-weight:bold;font-size:18px}
    table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
    th,td{border:1px solid #d1d5db;padding:6px 8px;vertical-align:top}
    th{background:#f3f4f6;text-align:left}
    .footer{margin-top:24px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
    @media print{body{margin:0}}
  </style></head><body>
    <h1>Schaltschrank-Simulator — Auswertung</h1>
    <div class="sub">Übungsmodul Elektrotechnik</div>
    <div class="meta">
      <div><strong>Name:</strong> ${escapeHtml(studentName || '—')}</div>
      <div><strong>Datum:</strong> ${escapeHtml(dateStr)}</div>
    </div>
    <div style="margin-bottom:8px">
      <span class="grade" style="background:${gradeColor(evalResult.grade)}">Note ${evalResult.grade} — ${escapeHtml(evalResult.gradeLabel)}</span>
      <span style="margin-left:16px;font-size:14px">${evalResult.solved} / ${evalResult.total} Übungen gelöst · ${evalResult.percent} % der Teilschritte</span>
    </div>
    <table>
      <thead><tr><th style="width:32px">Nr</th><th>Aufgabe</th><th style="width:90px">Niveau</th><th style="width:70px">Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">Erstellt mit dem Schaltschrank-Simulator · ${escapeHtml(dateStr)}</div>
    <script>window.onload=()=>{window.print()}</script>
  </body></html>`

  const w = window.open('', '_blank')
  if (!w) { alert('Bitte Pop-ups für den Druck erlauben.'); return }
  w.document.write(html)
  w.document.close()
}

function gradeColor(g: number): string {
  return { 1: '#16a34a', 2: '#65a30d', 3: '#eab308', 4: '#f97316', 5: '#ef4444', 6: '#dc2626' }[g] ?? '#6b7280'
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
