import { useState } from 'react'
import type { SimulationState } from '@/types/simulation'
import TopBar from '@/components/layout/TopBar'
import ComponentPalette from '@/components/palette/ComponentPalette'
import SchaltschrankCanvas from '@/components/canvas/SchaltschrankCanvas'
import PropertiesPanel from '@/components/panels/PropertiesPanel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function App() {
  const [simState, setSimState] = useState<SimulationState | null>(null)
  const [trippedComponents, setTrippedComponents] = useState<Set<string>>(new Set())

  useKeyboardShortcuts()

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <TopBar
        simState={simState}
        setSimState={setSimState}
        trippedComponents={trippedComponents}
        setTrippedComponents={setTrippedComponents}
      />
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette />
        <SchaltschrankCanvas simState={simState} />
        <PropertiesPanel simState={simState} />
      </div>
    </div>
  )
}
