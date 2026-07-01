import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'

const STEPS: Array<{ title: string; text: string; icon: string }> = [
  {
    icon: '🧰',
    title: 'Willkommen im Schaltschrank-Simulator',
    text: 'Hier baust du einen industriellen Schaltschrank auf: Bauteile auf Hutschienen setzen, verdrahten und die Schaltung simulieren. Diese kurze Einführung zeigt dir die Grundlagen.',
  },
  {
    icon: '🖱',
    title: '1. Bauteile platzieren',
    text: 'Zieh ein Bauteil aus der Bibliothek links auf eine Hutschiene. Ein grüner Schatten zeigt, wo es landet – rot bedeutet, der Platz ist belegt. Über das Suchfeld findest du Bauteile schnell.',
  },
  {
    icon: '✋',
    title: '2. Auswählen & Verschieben',
    text: 'Klicke ein platziertes Bauteil mit der linken Maustaste an, um es auszuwählen. Mit gedrückter Maustaste verschiebst du es – auch auf eine andere Hutschiene. Rechts erscheinen die Eigenschaften.',
  },
  {
    icon: '⚡',
    title: '3. Verdrahten',
    text: 'Wechsle mit Taste W in den Verdrahten-Modus. Wähle unten eine Leitungsfarbe (nach IEC), klicke dann nacheinander zwei Klemmen an, um sie zu verbinden.',
  },
  {
    icon: '▶',
    title: '4. Simulieren & Prüfen',
    text: 'Starte oben die Simulation, löse einen Kurzschluss aus und prüfe die Selektivität. Unten links meldet die Prüfung fachliche Fehler (z. B. zu dünne Leiter).',
  },
  {
    icon: '🎓',
    title: '5. Übungen',
    text: 'Über „📚 Übungen" oben findest du 10 Aufgaben mit automatischer Auswertung und Note. Bei Bedarf kannst du dir eine Musterlösung anzeigen lassen. Viel Erfolg!',
  },
]

export default function TutorialOverlay() {
  const open = useUIStore(s => s.tutorialOpen)
  const close = useUIStore(s => s.closeTutorial)
  const [step, setStep] = useState(0)

  if (!open) return null
  const s = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ background: '#000000cc' }}>
      <div
        className="rounded-xl shadow-2xl flex flex-col"
        style={{ background: '#0f172a', border: '1px solid #334155', width: 460 }}
      >
        <div className="p-6">
          <div className="text-4xl mb-3">{s.icon}</div>
          <div className="text-lg font-bold text-slate-100 mb-2">{s.title}</div>
          <div className="text-sm text-slate-400 leading-relaxed">{s.text}</div>
        </div>

        {/* Fortschrittspunkte */}
        <div className="flex justify-center gap-1.5 pb-4">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all"
              style={{ width: i === step ? 18 : 7, height: 7, background: i === step ? '#3b82f6' : '#334155' }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800">
          <button onClick={() => { setStep(0); close() }} className="text-xs text-slate-500 hover:text-slate-300">
            Überspringen
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-xs px-3 py-1.5 rounded font-medium"
                style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
              >
                Zurück
              </button>
            )}
            <button
              onClick={() => { if (last) { setStep(0); close() } else setStep(s => s + 1) }}
              className="text-xs px-4 py-1.5 rounded font-semibold"
              style={{ background: '#1d4ed8', color: '#dbeafe' }}
            >
              {last ? 'Los geht’s!' : 'Weiter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
