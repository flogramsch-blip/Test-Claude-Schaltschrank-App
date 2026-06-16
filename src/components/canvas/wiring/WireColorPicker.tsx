import type { WireColor } from '@/types/components'
import { WIRE_COLORS } from '@/utils/teGrid'
import { useUIStore } from '@/store/uiStore'

export const WIRE_COLOR_OPTIONS: Array<{ value: WireColor; label: string }> = [
  { value: 'brown',        label: 'Braun (L1)' },
  { value: 'black',        label: 'Schwarz (L2)' },
  { value: 'grey',         label: 'Grau (L3)' },
  { value: 'blue',         label: 'Blau (N)' },
  { value: 'green-yellow', label: 'Grün-Gelb (PE)' },
  { value: 'red',          label: 'Rot (Steuer +)' },
  { value: 'orange',       label: 'Orange (Steuer)' },
  { value: 'purple',       label: 'Violett (Signal)' },
  { value: 'white',        label: 'Weiß (Neutral)' },
]

export default function WireColorPicker() {
  const wireDrawing = useUIStore(s => s.wireDrawing)
  const setPendingWireColor = useUIStore(s => s.setPendingWireColor)

  if (!wireDrawing.active) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-1 p-2 rounded-lg shadow-xl z-50"
      style={{ background: '#1e293b', border: '1px solid #334155' }}
    >
      {WIRE_COLOR_OPTIONS.map(opt => (
        <button
          key={opt.value}
          title={opt.label}
          onClick={() => setPendingWireColor(opt.value)}
          className="rounded transition-transform hover:scale-110"
          style={{
            width: 22,
            height: 22,
            background: WIRE_COLORS[opt.value],
            border: wireDrawing.pendingColor === opt.value ? '2px solid #f59e0b' : '2px solid transparent',
          }}
        />
      ))}
      <div className="ml-2 self-center text-xs text-slate-400">
        Farbe wählen, dann Klemme klicken
      </div>
    </div>
  )
}
