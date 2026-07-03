import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { SimulationState } from '@/types/simulation'
import TopBar from '@/components/layout/TopBar'
import ComponentPalette from '@/components/palette/ComponentPalette'
import SchaltschrankCanvas from '@/components/canvas/SchaltschrankCanvas'
import PropertiesPanel from '@/components/panels/PropertiesPanel'
import ExercisePanel from '@/components/exercises/ExercisePanel'
import HoverTooltip from '@/components/canvas/HoverTooltip'
import StatusBar from '@/components/layout/StatusBar'
import ValidationPanel from '@/components/panels/ValidationPanel'
import TutorialOverlay from '@/components/onboarding/TutorialOverlay'
import ControlPanelDialog from '@/components/simulation/ControlPanelDialog'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { TE_WIDTH_PX, RAIL_X_OFFSET } from '@/utils/teGrid'
import { placementValidity } from '@/utils/validation'
import DoorCanvas from '@/components/door/DoorCanvas'
import { PANEL_CELL } from '@/components/door/PanelComponentRenderer'

export default function App() {
  const [simState, setSimState] = useState<SimulationState | null>(null)
  const [trippedComponents, setTrippedComponents] = useState<Set<string>>(new Set())
  const [dragDefId, setDragDefId] = useState<string | null>(null)

  const addComponent = useSchaltschrankStore(s => s.addComponent)
  const addPanelComponent = useSchaltschrankStore(s => s.addPanelComponent)
  const rails = useSchaltschrankStore(s => s.schaltschrank.rails)
  const surface = useUIStore(s => s.surface)
  const setPlacementPreview = useUIStore(s => s.setPlacementPreview)

  useKeyboardShortcuts()

  // Echte Cursor-Position mitschreiben – zuverlässiger als activator+delta,
  // da dnd-kit delta beim Auto-Scroll der Palette verfälscht.
  const lastPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => { lastPointer.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('pointermove', onMove, true)
    return () => window.removeEventListener('pointermove', onMove, true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  // Zielposition aus einem dnd-kit-Event bestimmen (Palette → Schiene).
  // TE-Position über die CTM der Innen-Zeichenfläche + echte Cursor-Position
  // (robust gegen Auto-Scroll-Verfälschung von event.delta).
  function targetFromEvent(event: DragEndEvent): { railId: string; definitionId: string; tePosition: number } | null {
    const { active, over } = event
    if (!over) return null
    const overId = String(over.id)
    if (!overId.startsWith('rail-')) return null
    const definitionId = active.data.current?.definitionId as string
    if (!definitionId) return null
    const railId = overId.replace('rail-', '')
    const svgEl = document.getElementById('interior-svg') as SVGSVGElement | null
    const g = svgEl?.querySelector('g') as SVGGraphicsElement | null
    const ctm = g?.getScreenCTM()
    if (!svgEl || !ctm) return null
    const pt = svgEl.createSVGPoint()
    pt.x = lastPointer.current.x; pt.y = lastPointer.current.y
    const loc = pt.matrixTransform(ctm.inverse())
    const tePosition = Math.max(0, Math.round((loc.x - RAIL_X_OFFSET) / TE_WIDTH_PX))
    return { railId, definitionId, tePosition }
  }

  function handleDragStart(event: DragStartEvent) {
    setDragDefId((event.active.data.current?.definitionId as string) ?? null)
  }

  function handleDragMove(event: DragEndEvent) {
    const t = targetFromEvent(event)
    if (!t) { setPlacementPreview(null); return }
    const def = COMPONENT_MAP.get(t.definitionId)
    if (!def) { setPlacementPreview(null); return }
    setPlacementPreview({
      railId: t.railId,
      tePosition: t.tePosition,
      teWidth: def.teWidth,
      valid: placementValidity(rails, t.railId, t.tePosition, def),
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragDefId(null)
    setPlacementPreview(null)
    const { active, over } = event
    if (!over) return
    const definitionId = active.data.current?.definitionId as string
    if (!definitionId) return
    // Drop auf die Fronttür → frei platzieren.
    // Position robust über die CTM der Türplatten-Gruppe umrechnen
    // (unabhängig von Scroll/Messung – over.rect ist dafür unzuverlässig).
    if (String(over.id) === 'door-panel') {
      const { x: px, y: py } = lastPointer.current
      const svgEl = document.getElementById('door-svg') as SVGSVGElement | null
      const g = svgEl?.querySelector('g') as SVGGraphicsElement | null
      const ctm = g?.getScreenCTM()
      if (svgEl && ctm) {
        const pt = svgEl.createSVGPoint()
        pt.x = px; pt.y = py
        const loc = pt.matrixTransform(ctm.inverse())
        addPanelComponent(definitionId, loc.x - PANEL_CELL / 2, loc.y - PANEL_CELL / 2)
      }
      return
    }
    const t = targetFromEvent(event)
    if (t) addComponent(t.definitionId, t.railId, t.tePosition)
  }

  function handleDragCancel() {
    setDragDefId(null)
    setPlacementPreview(null)
  }

  const dragDef = dragDefId ? COMPONENT_MAP.get(dragDefId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        <TopBar
          simState={simState}
          setSimState={setSimState}
          trippedComponents={trippedComponents}
          setTrippedComponents={setTrippedComponents}
        />
        <div className="flex flex-1 overflow-hidden">
          <ComponentPalette />
          <div className="relative flex flex-1 overflow-hidden">
            {surface === 'interior' ? <SchaltschrankCanvas simState={simState} /> : <DoorCanvas />}
            <ExercisePanel />
            <ValidationPanel />
          </div>
          <PropertiesPanel simState={simState} />
        </div>
        <StatusBar />
      </div>

      {/* Externe Steuereinheit / Bedienfeld */}
      <ControlPanelDialog />

      {/* Tutorial / Onboarding */}
      <TutorialOverlay />

      {/* Hover-Tooltip mit Bauteil-Infos */}
      <HoverTooltip />

      {/* Vorschau beim Ziehen */}
      <DragOverlay dropAnimation={null}>
        {dragDef ? (
          <div
            style={{
              padding: '4px 10px',
              background: '#1e293b',
              border: `2px solid ${dragDef.color}`,
              borderRadius: 4,
              color: '#e2e8f0',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {dragDef.shortName} · {dragDef.teWidth} TE
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
