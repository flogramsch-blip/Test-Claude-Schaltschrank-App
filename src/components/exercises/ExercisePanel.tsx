import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { EXERCISES, isExerciseDone, evaluateAll } from '@/data/exercises'
import { STERN_DREIECK_PRESET } from '@/data/presets'
import { SOLUTIONS } from '@/data/solutions'
import { printReport } from '@/utils/printReport'
import { loadCustomExercises, saveCustomExercises, checkCustom, type CustomExercise } from '@/data/customExercises'
import CustomExerciseDialog from './CustomExerciseDialog'

const DIFFICULTY_COLOR: Record<string, string> = {
  Einsteiger: '#22c55e',
  Leicht: '#eab308',
  Mittel: '#f97316',
  Profi: '#ef4444',
}

const GRADE_COLOR: Record<number, string> = {
  1: '#16a34a',
  2: '#65a30d',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
  6: '#dc2626',
}

export default function ExercisePanel() {
  const exercisesOpen = useUIStore(s => s.exercisesOpen)
  const toggleExercises = useUIStore(s => s.toggleExercises)
  const activeExerciseId = useUIStore(s => s.activeExerciseId)
  const setActiveExercise = useUIStore(s => s.setActiveExercise)
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const insertPreset = useSchaltschrankStore(s => s.insertPreset)
  const reset = useSchaltschrankStore(s => s.reset)
  const [showHints, setShowHints] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [customList, setCustomList] = useState<CustomExercise[]>(() => loadCustomExercises())
  const [editorOpen, setEditorOpen] = useState(false)

  function addCustom(ex: CustomExercise) {
    const next = [...customList, ex]
    setCustomList(next)
    saveCustomExercises(next)
  }
  function deleteCustom(id: string) {
    const next = customList.filter(e => e.id !== id)
    setCustomList(next)
    saveCustomExercises(next)
  }

  function showSolution(exerciseId: string) {
    const sol = SOLUTIONS[exerciseId]
    if (!sol) return
    if (!confirm('Aktuellen Aufbau durch die Musterlösung ersetzen?')) return
    reset()
    insertPreset(sol)
  }

  function handlePrint() {
    const results = EXERCISES.map(ex => {
      const steps = ex.check(schaltschrank)
      return { nr: ex.nr, title: ex.title, difficulty: ex.difficulty, done: isExerciseDone(steps), steps }
    })
    const now = new Date()
    const dateStr = now.toLocaleDateString('de-DE') + ' ' + now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    printReport(studentName, results, evalResult, dateStr)
  }

  if (!exercisesOpen) return null

  const active = EXERCISES.find(e => e.id === activeExerciseId) ?? null
  const activeSteps = active ? active.check(schaltschrank) : []
  const activeDone = active ? isExerciseDone(activeSteps) : false

  const evalResult = evaluateAll((id) => {
    const ex = EXERCISES.find(e => e.id === id)
    return ex ? ex.check(schaltschrank) : []
  })

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
            {/* Auswertung */}
            <div className="p-2.5 rounded" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Auswertung</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: GRADE_COLOR[evalResult.grade], color: '#fff' }}
                  title="Note basierend auf erfüllten Teilschritten"
                >
                  Note {evalResult.grade} · {evalResult.gradeLabel}
                </span>
              </div>
              {/* Fortschrittsbalken */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0f172a' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${evalResult.percent}%`, background: GRADE_COLOR[evalResult.grade] }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                <span>{evalResult.solved} / {evalResult.total} Übungen gelöst</span>
                <span>{evalResult.percent}%</span>
              </div>
              {/* Report drucken */}
              <div className="flex gap-1.5 mt-2">
                <input
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Name des Azubis"
                  className="flex-1 min-w-0 bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700 outline-none focus:border-blue-500"
                />
                <button
                  onClick={handlePrint}
                  className="text-xs px-2.5 py-1 rounded font-semibold shrink-0"
                  style={{ background: '#334155', color: '#e2e8f0' }}
                  title="Auswertung als druckbaren Report (PDF) öffnen"
                >
                  🖨 Report
                </button>
              </div>
            </div>

            {/* Übungsliste */}
            <div className="text-xs text-slate-500">
              {EXERCISES.length} Aufgaben. Wähle eine Aufgabe – der Fortschritt wird automatisch geprüft.
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

            {/* Eigene Aufgaben */}
            <div className="mt-1 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eigene Aufgaben</span>
                <button onClick={() => setEditorOpen(true)} className="text-xs text-blue-400 hover:text-blue-300">＋ Neu</button>
              </div>
              {customList.length === 0 ? (
                <div className="text-xs text-slate-600">Noch keine eigenen Aufgaben. Ausbilder können hier Aufgaben anlegen.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {customList.map(ex => {
                    const steps = checkCustom(ex, schaltschrank)
                    const done = isExerciseDone(steps)
                    return (
                      <div key={ex.id} className="p-2 rounded flex items-start gap-2" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                        <span className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold mt-0.5"
                          style={{ width: 18, height: 18, background: done ? '#16a34a' : '#334155', color: done ? '#fff' : '#94a3b8' }}>
                          {done ? '✓' : '•'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-200">{ex.title}</div>
                          <div className="flex flex-col gap-0.5 mt-1">
                            {steps.map((st, i) => (
                              <span key={i} className={`text-xs ${st.done ? 'text-green-400' : 'text-slate-500'}`}>
                                {st.done ? '✓' : '○'} {st.label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => deleteCustom(ex.id)} className="text-slate-600 hover:text-red-400 text-xs shrink-0">🗑</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

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

            <CustomExerciseDialog open={editorOpen} onClose={() => setEditorOpen(false)} onSave={addCustom} />
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

            {/* Musterlösung */}
            {SOLUTIONS[active.id] && (
              <button
                onClick={() => showSolution(active.id)}
                className="w-full py-2 text-sm rounded font-semibold transition-colors"
                style={{ background: '#334155', color: '#e2e8f0' }}
              >
                🔧 Musterlösung anzeigen
              </button>
            )}

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
