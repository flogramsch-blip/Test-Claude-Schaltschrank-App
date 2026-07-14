import { useEffect, useRef, useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragMoveEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { useUIStore } from '@/store/uiStore'
import { useZaehlerStore, canPlaceOnReihe } from '@/store/zaehlerStore'
import { ZAEHLER_COMPONENT_MAP, METER_DEVICE_IDS } from '@/data/zaehlerComponents'
import { feldOriginX, FELD_PADDING, ZTE_PX, FELD_TE } from './zaehlerGeometry'
import ZaehlerPalette from './ZaehlerPalette'
import ZaehlerCanvas from './ZaehlerCanvas'
import ZaehlerSidePanel from './ZaehlerSidePanel'

interface DropTarget { feldId: string; reiheId: string; tePosition: number }

export default function ZaehlerPlanerApp() {
  const setAppView = useUIStore(s => s.setAppView)
  const projekt = useZaehlerStore(s => s.projekt)
  const addFeld = useZaehlerStore(s => s.addFeld)
  const addDevice = useZaehlerStore(s => s.addDevice)
  const moveDevice = useZaehlerStore(s => s.moveDevice)
  const removeDevice = useZaehlerStore(s => s.removeDevice)
  const setPreview = useZaehlerStore(s => s.setPreview)
  const setSelected = useZaehlerStore(s => s.setSelected)
  const undo = useZaehlerStore(s => s.undo)
  const redo = useZaehlerStore(s => s.redo)
  const reset = useZaehlerStore(s => s.reset)
  const exportJSON = useZaehlerStore(s => s.exportJSON)
  const importJSON = useZaehlerStore(s => s.importJSON)
  const updateProjektInfo = useZaehlerStore(s => s.updateProjektInfo)

  const [activeDef, setActiveDef] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // Echte Cursor-Position (robust gegen dnd-kit-Delta-Verfälschung)
  const lastPointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => { lastPointer.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('pointermove', onMove, true)
    return () => window.removeEventListener('pointermove', onMove, true)
  }, [])

  // Lokale Tastenkürzel (nur solange dieser View gemountet ist)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo() }
        if (e.key === 'y' || (e.shiftKey && e.key === 'z')) { e.preventDefault(); redo() }
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sel = useZaehlerStore.getState().selectedInstanceId
        if (sel) { removeDevice(sel); setSelected(null) }
      }
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, removeDevice, setSelected])

  function targetFromEvent(event: DragEndEvent | DragMoveEvent): DropTarget | null {
    const over = event.over
    if (!over) return null
    const overId = String(over.id)
    if (!overId.startsWith('zreihe:')) return null
    const [, feldId, reiheId] = overId.split(':')
    const svg = document.getElementById('zaehler-svg') as SVGSVGElement | null
    const g = svg?.querySelector('g') as SVGGraphicsElement | null
    const ctm = g?.getScreenCTM()
    if (!svg || !ctm) return null
    const idx = projekt.felder.findIndex(f => f.id === feldId)
    if (idx < 0) return null
    const pt = svg.createSVGPoint()
    pt.x = lastPointer.current.x; pt.y = lastPointer.current.y
    const loc = pt.matrixTransform(ctm.inverse())
    const innerLeft = feldOriginX(idx) + FELD_PADDING
    const tePosition = Math.max(0, Math.min(FELD_TE, Math.round((loc.x - innerLeft) / ZTE_PX)))
    return { feldId, reiheId, tePosition }
  }

  function dataOf(event: DragStartEvent | DragMoveEvent | DragEndEvent) {
    return event.active.data.current as { definitionId?: string; instanceId?: string } | undefined
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDef(dataOf(event)?.definitionId ?? null)
  }

  function handleDragMove(event: DragMoveEvent) {
    const data = dataOf(event)
    const t = targetFromEvent(event)
    if (!data?.definitionId || !t) { setPreview(null); return }
    const reihe = projekt.felder.find(f => f.id === t.feldId)?.reihen.find(r => r.id === t.reiheId)
    if (!reihe) { setPreview(null); return }
    const def = ZAEHLER_COMPONENT_MAP.get(data.definitionId)
    const tePos = METER_DEVICE_IDS.has(data.definitionId) ? 0 : t.tePosition
    setPreview({
      feldId: t.feldId, reiheId: t.reiheId, tePosition: tePos,
      teWidth: def?.teWidth ?? 1,
      valid: canPlaceOnReihe(reihe, data.definitionId, tePos, data.instanceId),
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDef(null)
    setPreview(null)
    const data = dataOf(event)
    const t = targetFromEvent(event)
    if (!data || !t) return
    if (data.instanceId) moveDevice(data.instanceId, t.feldId, t.reiheId, t.tePosition)
    else if (data.definitionId) addDevice(t.feldId, t.reiheId, data.definitionId, t.tePosition)
  }

  function handleExport() {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${projekt.name.replace(/\s+/g, '_')}.zaehler.json`; a.click()
    URL.revokeObjectURL(url)
  }
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { try { importJSON(ev.target?.result as string) } catch { alert('Ungültige Zählerschrank-Datei') } }
    reader.readAsText(file); e.target.value = ''
  }

  const overlayDef = activeDef ? ZAEHLER_COMPONENT_MAP.get(activeDef) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} onDragCancel={() => { setActiveDef(null); setPreview(null) }}>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>
        {/* Kopfzeile (heller Hager-Stil) */}
        <div className="flex items-center gap-3 px-4 shrink-0" style={{ background: '#0f2f4a', minHeight: 52 }}>
          <button onClick={() => setAppView('simulator')} className="flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium"
            style={{ background: '#ffffff22', color: '#e2e8f0' }} title="Zurück zum Schaltschrank-Simulator">
            ← Simulator
          </button>
          <div className="text-slate-100 font-semibold text-sm">Zählerschrank-Planer</div>
          <div className="w-px h-5" style={{ background: '#ffffff33' }} />
          <input value={projekt.name} onChange={e => updateProjektInfo({ name: e.target.value })}
            className="bg-transparent text-slate-100 text-sm font-medium outline-none border-b border-transparent focus:border-slate-400" style={{ width: 200 }} />
          <div className="flex-1" />
          <button onClick={undo} className="px-2 py-1 text-xs rounded font-mono" style={{ background: '#ffffff18', color: '#cbd5e1' }} title="Rückgängig">↩</button>
          <button onClick={redo} className="px-2 py-1 text-xs rounded font-mono" style={{ background: '#ffffff18', color: '#cbd5e1' }} title="Wiederholen">↪</button>
          <button onClick={() => addFeld('zaehler')} className="px-2.5 py-1 text-xs rounded font-medium" style={{ background: '#2563eb', color: '#fff' }} title="Zählerfeld hinzufügen (weitere Typen über das + am Schrank)">+ Zählerfeld</button>
          <button onClick={() => fileRef.current?.click()} className="px-2.5 py-1 text-xs rounded font-medium" style={{ background: '#ffffff18', color: '#cbd5e1' }}>Laden</button>
          <button onClick={handleExport} className="px-2.5 py-1 text-xs rounded font-medium" style={{ background: '#ffffff18', color: '#cbd5e1' }}>Speichern</button>
          <button onClick={() => { if (confirm('Zählerschrank zurücksetzen?')) reset() }} className="px-2.5 py-1 text-xs rounded font-medium" style={{ background: '#ffffff18', color: '#fca5a5' }}>Reset</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <ZaehlerPalette />
          <ZaehlerCanvas />
          <ZaehlerSidePanel />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {overlayDef ? (
          <div style={{ padding: '4px 10px', background: '#fff', border: `2px solid ${overlayDef.color}`, borderRadius: 4, color: '#334155', fontSize: 12, fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
            {overlayDef.shortName}{METER_DEVICE_IDS.has(overlayDef.id) ? '' : ` · ${overlayDef.teWidth} TE`}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
