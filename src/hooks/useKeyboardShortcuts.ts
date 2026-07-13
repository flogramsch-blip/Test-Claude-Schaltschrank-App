import { useEffect, useRef } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'

export function useKeyboardShortcuts() {
  const setMode = useUIStore(s => s.setMode)
  const cancelWireDrawing = useUIStore(s => s.cancelWireDrawing)
  const wireDrawing = useUIStore(s => s.wireDrawing)
  const selectedInstanceId = useUIStore(s => s.selectedInstanceId)
  const selectedWireId = useUIStore(s => s.selectedWireId)
  const selectComponent = useUIStore(s => s.selectComponent)
  const selectWire = useUIStore(s => s.selectWire)
  const removeComponent = useSchaltschrankStore(s => s.removeComponent)
  const removeWire = useSchaltschrankStore(s => s.removeWire)
  const duplicateComponent = useSchaltschrankStore(s => s.duplicateComponent)
  const undo = useSchaltschrankStore(s => s.undo)
  const redo = useSchaltschrankStore(s => s.redo)
  const setZoom = useUIStore(s => s.setZoom)
  const zoom = useUIStore(s => s.zoom)
  const clipboard = useRef<string | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Im Zählerschrank-Planer greifen die Simulator-Shortcuts nicht
      if (useUIStore.getState().appView !== 'simulator') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo() }
        if (e.key === 'y' || (e.shiftKey && e.key === 'z')) { e.preventDefault(); redo() }
        if (e.key === 'c') { if (selectedInstanceId) clipboard.current = selectedInstanceId }
        if (e.key === 'v') {
          e.preventDefault()
          const src = clipboard.current ?? selectedInstanceId
          if (src) {
            const newId = duplicateComponent(src)
            if (newId) { selectComponent(newId); clipboard.current = newId }
          }
        }
        if (e.key === 'd') {
          e.preventDefault()
          if (selectedInstanceId) {
            const newId = duplicateComponent(selectedInstanceId)
            if (newId) selectComponent(newId)
          }
        }
        return
      }

      switch (e.key.toLowerCase()) {
        case 's': setMode('select'); break
        case 'w': setMode('wire'); break
        case 'd': setMode('delete'); break
        case 'escape':
          if (wireDrawing.active) { cancelWireDrawing() }
          selectComponent(null)
          selectWire(null)
          setMode('select')
          break
        case 'delete':
        case 'backspace':
          if (selectedInstanceId) { removeComponent(selectedInstanceId); selectComponent(null) }
          else if (selectedWireId) { removeWire(selectedWireId); selectWire(null) }
          break
        case '+':
        case '=':
          setZoom(zoom + 0.1)
          break
        case '-':
          setZoom(zoom - 0.1)
          break
        case '0':
          setZoom(1)
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [wireDrawing.active, selectedInstanceId, selectedWireId, zoom, undo, redo, duplicateComponent])
}
