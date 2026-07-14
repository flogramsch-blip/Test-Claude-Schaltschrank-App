import { create } from 'zustand'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'
import type { ZaehlerschrankProjekt, ZaehlerFeld, ZaehlerReihe, ZaehlerReihenTyp, ZaehlerFeldTyp } from '@/types/zaehlerschrank'
import { ZAEHLER_COMPONENT_MAP, METER_DEVICE_IDS } from '@/data/zaehlerComponents'
import { checkTECollision } from '@/utils/validation'
import { FELD_TE } from '@/components/zaehler/zaehlerGeometry'

const AUTOSAVE_KEY = 'zaehlerschrank-autosave-v1'

/** Reihen-Startlayout je Feldtyp (Reihen bleiben danach frei umstellbar). */
const FELD_LAYOUTS: Record<ZaehlerFeldTyp, ZaehlerReihenTyp[]> = {
  zaehler:        ['anschlussraum-oben', 'zaehlerplatz', 'apz', 'anschlussraum-unten'],
  verteiler:      ['verteiler', 'verteiler', 'verteiler', 'verteiler', 'verteiler'],
  multimedia:     ['verteiler', 'verteiler', 'verteiler', 'verteiler'],
  lastmanagement: ['anschlussraum-oben', 'verteiler', 'verteiler', 'apz'],
  leer:           ['reserve', 'reserve', 'reserve', 'reserve'],
  schrankgehaeuse:['reserve', 'reserve', 'reserve', 'reserve', 'reserve'],
  einspeise:      ['anschlussraum-oben', 'apz', 'anschlussraum-unten'],
}

export function createFeld(type: ZaehlerFeldTyp): ZaehlerFeld {
  return {
    id: uuidv4(),
    type,
    reihen: FELD_LAYOUTS[type].map(t => ({ id: uuidv4(), type: t, devices: [] } as ZaehlerReihe)),
  }
}

export function createDefaultProjekt(): ZaehlerschrankProjekt {
  return {
    id: uuidv4(),
    name: 'Zählerschrank EFH',
    felder: [createFeld('zaehler')],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  }
}

/** Ältere Autosaves ohne `feld.type` verträglich machen. */
function normalizeProjekt(p: ZaehlerschrankProjekt): ZaehlerschrankProjekt {
  for (const f of p.felder) if (!f.type) f.type = 'zaehler'
  return p
}

function loadAutosave(): ZaehlerschrankProjekt | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data && Array.isArray(data.felder)) return normalizeProjekt(data as ZaehlerschrankProjekt)
  } catch { /* ignore */ }
  return null
}
function saveAutosave(p: ZaehlerschrankProjekt) {
  try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(p)) } catch { /* ignore */ }
}

export interface ZaehlerPreview {
  feldId: string
  reiheId: string
  tePosition: number
  teWidth: number
  valid: boolean
}

interface HistoryEntry { projekt: ZaehlerschrankProjekt }

interface ZaehlerStore {
  projekt: ZaehlerschrankProjekt
  past: HistoryEntry[]
  future: HistoryEntry[]
  selectedInstanceId: string | null
  preview: ZaehlerPreview | null

  addFeld: (type: ZaehlerFeldTyp) => void
  removeFeld: (feldId: string) => void
  setReihenTyp: (feldId: string, reiheId: string, typ: ZaehlerReihenTyp) => void
  addDevice: (feldId: string, reiheId: string, definitionId: string, tePosition: number) => string | null
  moveDevice: (instanceId: string, feldId: string, reiheId: string, tePosition: number) => boolean
  removeDevice: (instanceId: string) => void
  updateProjektInfo: (partial: Partial<Pick<ZaehlerschrankProjekt, 'name' | 'bauherr' | 'ort' | 'bemerkung'>>) => void
  setSelected: (id: string | null) => void
  setPreview: (p: ZaehlerPreview | null) => void
  undo: () => void
  redo: () => void
  reset: () => void
  exportJSON: () => string
  importJSON: (json: string) => void
}

const MAX_HISTORY = 50
function snapshot(p: ZaehlerschrankProjekt): ZaehlerschrankProjekt {
  return JSON.parse(JSON.stringify(p)) as ZaehlerschrankProjekt
}
function pushHistory(past: HistoryEntry[], current: ZaehlerschrankProjekt): HistoryEntry[] {
  const next = [...past, { projekt: snapshot(current) }]
  if (next.length > MAX_HISTORY) next.shift()
  return next
}

/** Darf `definitionId` an `tePosition` auf diese Reihe? (auch für Vorschau) */
export function canPlaceOnReihe(
  reihe: ZaehlerReihe,
  definitionId: string,
  tePosition: number,
  excludeInstanceId?: string
): boolean {
  const def = ZAEHLER_COMPONENT_MAP.get(definitionId)
  if (!def) return false
  const isMeter = METER_DEVICE_IDS.has(definitionId)

  if (reihe.type === 'reserve') return false
  if (reihe.type === 'zaehlerplatz') {
    if (!isMeter) return false
    // genau ein Zähler je Platz
    return reihe.devices.every(d => d.instanceId === excludeInstanceId)
  }
  // TE-Reihen (verteiler / anschlussraum-oben / -unten)
  if (isMeter) return false
  if (tePosition < 0 || tePosition + def.teWidth > FELD_TE) return false
  const existing = reihe.devices.map(d => ({
    tePosition: d.tePosition,
    teWidth: ZAEHLER_COMPONENT_MAP.get(d.definitionId)?.teWidth ?? 1,
    instanceId: d.instanceId,
  }))
  return !checkTECollision(tePosition, def.teWidth, existing, excludeInstanceId)
}

function findReihe(p: ZaehlerschrankProjekt, feldId: string, reiheId: string): ZaehlerReihe | undefined {
  return p.felder.find(f => f.id === feldId)?.reihen.find(r => r.id === reiheId)
}

export const useZaehlerStore = create<ZaehlerStore>((set, get) => ({
  projekt: loadAutosave() ?? createDefaultProjekt(),
  past: [],
  future: [],
  selectedInstanceId: null,
  preview: null,

  addFeld: (type) => set(produce((d: ZaehlerStore) => {
    d.past = pushHistory(d.past, d.projekt); d.future = []
    d.projekt.felder.push(createFeld(type))
    d.projekt.modifiedAt = new Date().toISOString()
  })),

  removeFeld: (feldId) => set(produce((d: ZaehlerStore) => {
    if (d.projekt.felder.length <= 1) return   // letztes Feld bleibt
    d.past = pushHistory(d.past, d.projekt); d.future = []
    d.projekt.felder = d.projekt.felder.filter(f => f.id !== feldId)
    d.projekt.modifiedAt = new Date().toISOString()
  })),

  setReihenTyp: (feldId, reiheId, typ) => set(produce((d: ZaehlerStore) => {
    const reihe = findReihe(d.projekt, feldId, reiheId)
    if (!reihe || reihe.type === typ) return
    d.past = pushHistory(d.past, d.projekt); d.future = []
    reihe.type = typ
    // Geräte entfernen, die im neuen Reihentyp nicht mehr zulässig sind
    reihe.devices = reihe.devices.filter(dev => {
      const isMeter = METER_DEVICE_IDS.has(dev.definitionId)
      if (typ === 'reserve') return false
      if (typ === 'zaehlerplatz') return isMeter
      return !isMeter
    })
    // bei Zählerplatz nur ein Gerät behalten
    if (typ === 'zaehlerplatz' && reihe.devices.length > 1) reihe.devices = reihe.devices.slice(0, 1)
    d.projekt.modifiedAt = new Date().toISOString()
  })),

  addDevice: (feldId, reiheId, definitionId, tePosition) => {
    const reihe = findReihe(get().projekt, feldId, reiheId)
    if (!reihe || !canPlaceOnReihe(reihe, definitionId, tePosition)) return null
    const instanceId = uuidv4()
    const isMeter = METER_DEVICE_IDS.has(definitionId)
    set(produce((d: ZaehlerStore) => {
      d.past = pushHistory(d.past, d.projekt); d.future = []
      const r = findReihe(d.projekt, feldId, reiheId)!
      r.devices.push({ instanceId, definitionId, tePosition: isMeter ? 0 : tePosition })
      d.projekt.modifiedAt = new Date().toISOString()
    }))
    return instanceId
  },

  moveDevice: (instanceId, feldId, reiheId, tePosition) => {
    const p = get().projekt
    // Quell-Gerät finden
    let def: string | null = null
    for (const f of p.felder) for (const r of f.reihen) {
      const dev = r.devices.find(x => x.instanceId === instanceId)
      if (dev) def = dev.definitionId
    }
    if (!def) return false
    const target = findReihe(p, feldId, reiheId)
    if (!target || !canPlaceOnReihe(target, def, tePosition, instanceId)) return false
    const isMeter = METER_DEVICE_IDS.has(def)
    set(produce((d: ZaehlerStore) => {
      d.past = pushHistory(d.past, d.projekt); d.future = []
      // aus alter Reihe entfernen
      for (const f of d.projekt.felder) for (const r of f.reihen) {
        const idx = r.devices.findIndex(x => x.instanceId === instanceId)
        if (idx !== -1) r.devices.splice(idx, 1)
      }
      const tr = findReihe(d.projekt, feldId, reiheId)!
      tr.devices.push({ instanceId, definitionId: def!, tePosition: isMeter ? 0 : tePosition })
      d.projekt.modifiedAt = new Date().toISOString()
    }))
    return true
  },

  removeDevice: (instanceId) => set(produce((d: ZaehlerStore) => {
    d.past = pushHistory(d.past, d.projekt); d.future = []
    for (const f of d.projekt.felder) for (const r of f.reihen) {
      const idx = r.devices.findIndex(x => x.instanceId === instanceId)
      if (idx !== -1) r.devices.splice(idx, 1)
    }
    d.projekt.modifiedAt = new Date().toISOString()
  })),

  updateProjektInfo: (partial) => set(produce((d: ZaehlerStore) => {
    Object.assign(d.projekt, partial)
    d.projekt.modifiedAt = new Date().toISOString()
  })),

  setSelected: (id) => set({ selectedInstanceId: id }),
  setPreview: (preview) => set({ preview }),

  undo: () => {
    const { past, projekt } = get()
    if (past.length === 0) return
    const prev = past[past.length - 1]
    set(produce((d: ZaehlerStore) => {
      d.future = [{ projekt: snapshot(projekt) }, ...d.future]
      d.past = d.past.slice(0, -1)
      d.projekt = prev.projekt
    }))
  },
  redo: () => {
    const { future, projekt } = get()
    if (future.length === 0) return
    const next = future[0]
    set(produce((d: ZaehlerStore) => {
      d.past = [...d.past, { projekt: snapshot(projekt) }]
      d.future = d.future.slice(1)
      d.projekt = next.projekt
    }))
  },
  reset: () => set({ projekt: createDefaultProjekt(), past: [], future: [], selectedInstanceId: null, preview: null }),
  exportJSON: () => JSON.stringify(get().projekt, null, 2),
  importJSON: (json) => {
    const data = JSON.parse(json) as ZaehlerschrankProjekt
    if (!Array.isArray(data.felder)) throw new Error('Ungültiges Zählerschrank-Projekt')
    set({ projekt: normalizeProjekt(data), past: [], future: [], selectedInstanceId: null, preview: null })
  },
}))

// Autosave (eigener Schlüssel, unabhängig vom Simulator)
useZaehlerStore.subscribe((state, prev) => {
  if (state.projekt !== prev.projekt) saveAutosave(state.projekt)
})
