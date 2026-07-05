import { create } from 'zustand'
import type { WireColor } from '@/types/components'

export type EditorMode = 'select' | 'wire' | 'delete' | 'simulate'

interface WireDrawingState {
  active: boolean
  fromInstanceId: string | null
  fromConnectionId: string | null
  fromX: number
  fromY: number
  currentX: number
  currentY: number
  pendingColor: WireColor
  waypoints: Array<{ x: number; y: number }>  // manuell gesetzte Zwischenstops (Ecken)
}

interface UIStore {
  mode: EditorMode
  selectedInstanceId: string | null
  selectedWireId: string | null
  zoom: number
  panX: number
  panY: number
  wireDrawing: WireDrawingState
  simulationRunning: boolean
  faultWireId: string | null
  pressedButtons: Set<string>
  manualTripped: Set<string>
  exercisesOpen: boolean
  activeExerciseId: string | null
  hover: { instanceId: string | null; x: number; y: number }
  placementPreview: { railId: string; tePosition: number; teWidth: number; valid: boolean } | null
  lightCanvas: boolean
  showCabinetWall: boolean
  controlPanelOpen: boolean
  surface: 'interior' | 'door'
  defaultCrossing: 'harting' | 'conduit' | 'terminal'
  tutorialOpen: boolean
  voltagePromptWireId: string | null   // nach Verbinden: Spannungsabfrage offen
  lastVoltage: string                  // zuletzt gewählte Spannung (Vorauswahl)

  setMode: (mode: EditorMode) => void
  selectComponent: (instanceId: string | null) => void
  selectWire: (wireId: string | null) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  startWireDrawing: (fromInstanceId: string, fromConnectionId: string, fromX: number, fromY: number) => void
  updateWireDrawingMouse: (x: number, y: number) => void
  addWireWaypoint: (x: number, y: number) => void
  cancelWireDrawing: () => void
  setPendingWireColor: (color: WireColor) => void
  openVoltagePrompt: (wireId: string) => void
  closeVoltagePrompt: () => void
  setLastVoltage: (voltage: string) => void
  setSimulationRunning: (running: boolean) => void
  setFaultWire: (wireId: string | null) => void
  toggleButton: (instanceId: string) => void
  resetButtons: () => void
  toggleTrip: (instanceId: string) => void
  resetTripped: () => void
  toggleExercises: () => void
  setActiveExercise: (id: string | null) => void
  setHover: (instanceId: string, x: number, y: number) => void
  clearHover: () => void
  setPlacementPreview: (p: { railId: string; tePosition: number; teWidth: number; valid: boolean } | null) => void
  toggleLightCanvas: () => void
  toggleCabinetWall: () => void
  toggleControlPanel: () => void
  setSurface: (surface: 'interior' | 'door') => void
  setDefaultCrossing: (c: 'harting' | 'conduit' | 'terminal') => void
  openTutorial: () => void
  closeTutorial: () => void
}

function tutorialSeen(): boolean {
  try { return localStorage.getItem('tutorial-seen-v1') === '1' } catch { return true }
}

export const useUIStore = create<UIStore>((set) => ({
  mode: 'select',
  selectedInstanceId: null,
  selectedWireId: null,
  zoom: 1.0,
  panX: 20,
  panY: 20,
  wireDrawing: {
    active: false,
    fromInstanceId: null,
    fromConnectionId: null,
    fromX: 0,
    fromY: 0,
    currentX: 0,
    currentY: 0,
    pendingColor: 'black',
    waypoints: [],
  },
  simulationRunning: false,
  faultWireId: null,
  pressedButtons: new Set<string>(),
  manualTripped: new Set<string>(),
  exercisesOpen: false,
  activeExerciseId: null,
  hover: { instanceId: null, x: 0, y: 0 },
  placementPreview: null,
  lightCanvas: false,
  showCabinetWall: true,
  controlPanelOpen: false,
  surface: 'interior',
  defaultCrossing: 'harting',
  tutorialOpen: !tutorialSeen(),
  voltagePromptWireId: null,
  lastVoltage: '',

  setMode: (mode) => set({ mode, selectedInstanceId: null, selectedWireId: null }),
  selectComponent: (instanceId) => set({ selectedInstanceId: instanceId, selectedWireId: null }),
  selectWire: (wireId) => set({ selectedWireId: wireId, selectedInstanceId: null }),
  setZoom: (zoom) => set({ zoom: Math.max(0.3, Math.min(3, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),

  startWireDrawing: (fromInstanceId, fromConnectionId, fromX, fromY) =>
    set(s => ({
      wireDrawing: {
        ...s.wireDrawing,
        active: true,
        fromInstanceId,
        fromConnectionId,
        fromX,
        fromY,
        currentX: fromX,
        currentY: fromY,
        waypoints: [],
      },
    })),

  updateWireDrawingMouse: (x, y) =>
    set(s => ({
      wireDrawing: { ...s.wireDrawing, currentX: x, currentY: y },
    })),

  addWireWaypoint: (x, y) =>
    set(s => (s.wireDrawing.active
      ? { wireDrawing: { ...s.wireDrawing, waypoints: [...s.wireDrawing.waypoints, { x, y }] } }
      : s)),

  cancelWireDrawing: () =>
    set(s => ({
      wireDrawing: { ...s.wireDrawing, active: false, fromInstanceId: null, fromConnectionId: null, waypoints: [] },
    })),

  setPendingWireColor: (color) =>
    set(s => ({ wireDrawing: { ...s.wireDrawing, pendingColor: color } })),

  openVoltagePrompt: (wireId) => set({ voltagePromptWireId: wireId }),
  closeVoltagePrompt: () => set({ voltagePromptWireId: null }),
  setLastVoltage: (voltage) => set({ lastVoltage: voltage }),

  setSimulationRunning: (running) => set({ simulationRunning: running }),
  setFaultWire: (wireId) => set({ faultWireId: wireId }),
  toggleButton: (instanceId) => set(s => {
    const next = new Set(s.pressedButtons)
    if (next.has(instanceId)) next.delete(instanceId)
    else next.add(instanceId)
    return { pressedButtons: next }
  }),
  resetButtons: () => set(s => (s.pressedButtons.size === 0 ? s : { pressedButtons: new Set<string>() })),
  toggleTrip: (instanceId) => set(s => {
    const next = new Set(s.manualTripped)
    if (next.has(instanceId)) next.delete(instanceId)
    else next.add(instanceId)
    return { manualTripped: next }
  }),
  resetTripped: () => set(s => (s.manualTripped.size === 0 ? s : { manualTripped: new Set<string>() })),
  toggleExercises: () => set(s => ({ exercisesOpen: !s.exercisesOpen })),
  setActiveExercise: (id) => set({ activeExerciseId: id }),
  setHover: (instanceId, x, y) => set({ hover: { instanceId, x, y } }),
  clearHover: () => set(s => (s.hover.instanceId === null ? s : { hover: { instanceId: null, x: 0, y: 0 } })),
  setPlacementPreview: (p) => set({ placementPreview: p }),
  toggleLightCanvas: () => set(s => ({ lightCanvas: !s.lightCanvas })),
  toggleCabinetWall: () => set(s => ({ showCabinetWall: !s.showCabinetWall })),
  toggleControlPanel: () => set(s => ({ controlPanelOpen: !s.controlPanelOpen })),
  setSurface: (surface) => set({ surface, selectedInstanceId: null, selectedWireId: null }),
  setDefaultCrossing: (c) => set({ defaultCrossing: c }),
  openTutorial: () => set({ tutorialOpen: true }),
  closeTutorial: () => {
    try { localStorage.setItem('tutorial-seen-v1', '1') } catch { /* ignore */ }
    set({ tutorialOpen: false })
  },
}))
