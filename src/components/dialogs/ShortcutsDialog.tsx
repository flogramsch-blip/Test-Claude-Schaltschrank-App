interface Props {
  open: boolean
  onClose: () => void
}

const SHORTCUTS: Array<{ keys: string; desc: string }> = [
  { keys: 'S', desc: 'Auswahl-Modus' },
  { keys: 'W', desc: 'Verdrahten-Modus' },
  { keys: 'D', desc: 'Löschen-Modus' },
  { keys: 'Esc', desc: 'Abbrechen / Auswahl aufheben' },
  { keys: 'Entf / ⌫', desc: 'Ausgewähltes Element löschen' },
  { keys: 'Strg + Z', desc: 'Rückgängig' },
  { keys: 'Strg + Y', desc: 'Wiederholen' },
  { keys: '+ / −', desc: 'Zoom ein/aus' },
  { keys: '0', desc: 'Zoom 100 %' },
  { keys: '?', desc: 'Diese Hilfe anzeigen' },
]

const TIPS: string[] = [
  'Bauteile aus der Palette links auf eine Hutschiene ziehen.',
  'Bauteile mit linker Maustaste anklicken und verschieben (auch zwischen Schienen).',
  'Mit gedrückter mittlerer/rechter Maustaste die Ansicht verschieben (Pan).',
  'Mausrad = Zoom.',
  'Beim Verdrahten zuerst die Farbe wählen, dann zwei Klemmen anklicken.',
]

export default function ShortcutsDialog({ open, onClose }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#00000099' }} onClick={onClose}>
      <div
        className="rounded-lg shadow-2xl"
        style={{ background: '#0f172a', border: '1px solid #334155', width: 520 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="text-sm font-bold text-slate-200">⌨ Tastenkürzel & Tipps</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Tastenkürzel</div>
            <div className="flex flex-col gap-1.5">
              {SHORTCUTS.map(s => (
                <div key={s.keys} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{s.desc}</span>
                  <kbd className="font-mono px-1.5 py-0.5 rounded text-slate-200" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Tipps</div>
            <ul className="flex flex-col gap-2">
              {TIPS.map((t, i) => (
                <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                  <span className="text-blue-500">•</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
