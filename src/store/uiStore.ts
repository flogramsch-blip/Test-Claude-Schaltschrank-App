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
  exercisesOpen: boolean
  activeExerciseId: string | null

  setMode: (mode: EditorMode) => void
  selectComponent: (instanceId: string | null) => void
  selectWire: (wireId: string | null) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  startWireDrawing: (fromInstanceId: string, fromConnectionId: string, fromX: number, fromY: number) => void
  updateWireDrawingMouse: (x: number, y: number) => void
  cancelWireDrawing: () => void
  setPendingWireColor: (color: WireColor) => void
  setSimulationRunning: (running: boolean) => void
  setFaultWire: (wireId: string | null) => void
  toggleExercises: () => void
  setActiveExercise: (id: string | null) => void
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
  },
  simulationRunning: false,
  faultWireId: null,
  exercisesOpen: false,
  activeExerciseId: null,

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
      },
    })),

  updateWireDrawingMouse: (x, y) =>
    set(s => ({
      wireDrawing: { ...s.wireDrawing, currentX: x, currentY: y },
    })),

  cancelWireDrawing: () =>
    set(s => ({
      wireDrawing: { ...s.wireDrawing, active: false, fromInstanceId: null, fromConnectionId: null },
    })),

  setPendingWireColor: (color) =>
    set(s => ({ wireDrawing: { ...s.wireDrawing, pendingColor: color } })),

  setSimulationRunning: (running) => set({ simulationRunning: running }),
  setFaultWire: (wireId) => set({ faultWireId: wireId }),
  toggleExercises: () => set(s => ({ exercisesOpen: !s.exercisesOpen })),
  setActiveExercise: (id) => set({ activeExerciseId: id }),
}))
