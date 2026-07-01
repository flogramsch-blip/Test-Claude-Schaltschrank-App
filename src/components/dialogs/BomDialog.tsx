import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { buildBOM } from '@/utils/bom'

interface Props {
  open: boolean
  onClose: () => void
}

export default function BomDialog({ open, onClose }: Props) {
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  if (!open) return null

  const { entries, totalTE, totalCount } = buildBOM(schaltschrank)

  function exportCsv() {
    const header = 'Anzahl;Bauteil;Kurzname;TE/Stk;TE gesamt;Nennströme;Kennzeichen'
    const rows = entries.map(e =>
      [e.count, e.name, e.shortName, e.teEach, e.teTotal, e.currents, e.labels.join(' ')].join(';')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${schaltschrank.name.replace(/\s+/g, '_')}_Stueckliste.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#00000099' }} onClick={onClose}>
      <div
        className="rounded-lg shadow-2xl flex flex-col"
        style={{ background: '#0f172a', border: '1px solid #334155', width: 640, maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="text-sm font-bold text-slate-200">📋 Stückliste (BOM)</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
        </div>

        <div className="overflow-y-auto p-4">
          {entries.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-8">Noch keine Bauteile platziert.</div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="py-2 pr-2">Anz.</th>
                  <th className="py-2 pr-2">Bauteil</th>
                  <th className="py-2 pr-2">TE/Stk</th>
                  <th className="py-2 pr-2">TE ges.</th>
                  <th className="py-2 pr-2">Nennströme</th>
                  <th className="py-2">Kennzeichen</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.definitionId} className="border-b border-slate-800 text-slate-300">
                    <td className="py-1.5 pr-2 font-mono font-bold">{e.count}×</td>
                    <td className="py-1.5 pr-2">{e.name}</td>
                    <td className="py-1.5 pr-2 font-mono">{e.teEach}</td>
                    <td className="py-1.5 pr-2 font-mono">{e.teTotal}</td>
                    <td className="py-1.5 pr-2 text-amber-400 font-mono">{e.currents || '–'}</td>
                    <td className="py-1.5 font-mono text-slate-400">{e.labels.join(', ') || '–'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-slate-200 font-bold">
                  <td className="py-2 pr-2 font-mono">{totalCount}×</td>
                  <td className="py-2 pr-2">Summe</td>
                  <td></td>
                  <td className="py-2 pr-2 font-mono">{totalTE} TE</td>
                  <td colSpan={2} className="py-2 text-slate-500 font-normal">≈ {(totalTE * 18 / 1000).toFixed(2)} m Schiene</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {entries.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={exportCsv}
              className="text-xs px-3 py-1.5 rounded font-semibold"
              style={{ background: '#1d4ed8', color: '#dbeafe' }}
            >
              Als CSV exportieren
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
