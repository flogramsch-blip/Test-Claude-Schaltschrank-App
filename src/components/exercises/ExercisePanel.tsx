import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { EXERCISES, isExerciseDone } from '@/data/exercises'
import { STERN_DREIECK_PRESET } from '@/data/presets'

const DIFFICULTY_COLOR: Record<string, string> = {
  Einsteiger: '#22c55e',
  Leicht: '#eab308',
  Mittel: '#f97316',
}

export default function ExercisePanel() {
  const exercisesOpen = useUIStore(s => s.exercisesOpen)
  const toggleExercises = useUIStore(s => s.toggleExercises)
  const activeExerciseId = useUIStore(s => s.activeExerciseId)
  const setActiveExercise = useUIStore(s => s.setActiveExercise)
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const insertPreset = useSchaltschrankStore(s => s.insertPreset)
  const [showHints, setShowHints] = useState(false)

  if (!exercisesOpen) return null

  const active = EXERCISES.find(e => e.id === activeExerciseId) ?? null
  const activeSteps = active ? active.check(schaltschrank) : []
  const activeDone = active ? isExerciseDone(activeSteps) : false

  return (
    <div
      className="absolute top-3 left-3 z-40 flex flex-col rounded-lg shadow-2xl"
      style={{ background: '#0f172a', border: '1px solid #334155', width: 340, maxHeight: 'calc(100% - 24px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
        <div className="text-sm font-bold text-slate-200">📚 Übungen – Einführung</div>
        <button onClick={toggleExercises} className="text-slate-500 hover:text-slate-300 text-lg leading-none px-1">×</button>
      </div>

      <div className="overflow-y-auto p-3 flex flex-col gap-3">
        {!active ? (
          <>
            {/* Übungsliste */}
            <div className="text-xs text-slate-500">
              5 Aufgaben zum Einstieg. Wähle eine Aufgabe – der Fortschritt wird automatisch geprüft.
            </div>
            {EXERCISES.map(ex => {
              const steps = ex.check(schaltschrank)
              const done = isExerciseDone(steps)
              return (
                <button
                  key={ex.id}
                  onClick={() => { setActiveExercise(ex.id); setShowHints(false) }}
                  className="text-left p-2.5 rounded transition-colors hover:bg-slate-800"
                  style={{ background: '#1e293b', border: '1px solid #334155' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        width: 20, height: 20,
                        background: done ? '#16a34a' : '#334155',
                        color: done ? '#fff' : '#94a3b8',
                      }}
                    >
                      {done ? '✓' : ex.nr}
                    </span>
                    <span className="text-sm font-semibold text-slate-200 flex-1">{ex.title}</span>
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: DIFFICULTY_COLOR[ex.difficulty], background: '#0f172a' }}>
                      {ex.difficulty}
                    </span>
                  </div>
                </button>
              )
            })}

            {/* Preset-Einfügen */}
            <div className="mt-1 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-500 mb-2">Vorlage zum Ansehen / Lernen:</div>
              <button
                onClick={() => insertPreset(STERN_DREIECK_PRESET)}
                className="w-full py-2 text-sm rounded font-semibold transition-colors"
                style={{ background: '#1d4ed8', color: '#dbeafe' }}
              >
                ⚙ Stern-Dreieck-Set einfügen
              </button>
              <div className="text-xs text-slate-600 mt-1.5">
                Fügt Motorschutz, 3 Schütze und Zeitrelais mit vorverdrahtetem Hauptstromkreis ein.
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Aktive Übung */}
            <button onClick={() => setActiveExercise(null)} className="text-xs text-slate-500 hover:text-slate-300 self-start">
              ← Zurück zur Übersicht
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: DIFFICULTY_COLOR[active.difficulty], background: '#1e293b' }}>
                {active.difficulty}
              </span>
              <span className="text-sm font-bold text-slate-100">Übung {active.nr}: {active.title}</span>
            </div>

            {/* Aufgabenstellung */}
            <div className="text-xs text-slate-300 leading-relaxed p-2.5 rounded" style={{ background: '#1e293b' }}>
              {active.task}
            </div>

            {/* Fortschritt / Checkliste */}
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-slate-400">Fortschritt</div>
              {activeSteps.map((st, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span
                    className="shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 16, height: 16, background: st.done ? '#16a34a' : '#334155', color: '#fff', fontSize: 10 }}
                  >
                    {st.done ? '✓' : ''}
                  </span>
                  <span className={st.done ? 'text-green-400' : 'text-slate-400'}>{st.label}</span>
                </div>
              ))}
            </div>

            {/* Erfolg */}
            {activeDone && (
              <div className="text-center py-2 rounded font-bold text-sm" style={{ background: '#14532d', color: '#86efac' }}>
                🎉 Geschafft! Aufgabe gelöst.
              </div>
            )}

            {/* Tipps */}
            <div>
              <button onClick={() => setShowHints(h => !h)} className="text-xs text-blue-400 hover:text-blue-300">
                {showHints ? '▾' : '▸'} Tipps {showHints ? 'ausblenden' : 'anzeigen'}
              </button>
              {showHints && (
                <ul className="mt-1.5 flex flex-col gap-1">
                  {active.hints.map((h, i) => (
                    <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                      <span className="text-slate-600">•</span>{h}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Stern-Dreieck Hilfe bei Übung 4 */}
            {active.id === 'ex4' && (
              <button
                onClick={() => insertPreset(STERN_DREIECK_PRESET)}
                className="w-full py-2 text-sm rounded font-semibold transition-colors"
                style={{ background: '#1d4ed8', color: '#dbeafe' }}
              >
                ⚙ Stern-Dreieck-Vorlage einfügen
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
