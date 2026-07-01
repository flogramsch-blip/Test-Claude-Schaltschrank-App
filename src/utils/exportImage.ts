import { TE_WIDTH_PX, RAIL_X_OFFSET, ROW_TOTAL_HEIGHT_PX } from '@/utils/teGrid'
import type { Schaltschrank } from '@/types/schaltschrank'

export function contentSize(s: Schaltschrank) {
  const width = s.rails.reduce((m, r) => Math.max(m, RAIL_X_OFFSET + r.lengthTE * TE_WIDTH_PX + 40), 400)
  const height = s.rails.reduce((m, r) => Math.max(m, r.yPosition + ROW_TOTAL_HEIGHT_PX + 20), 200)
  return { width, height }
}

/** Baut ein eigenständiges SVG (ohne Zoom/Pan) aus dem Canvas-SVG. */
function buildStandaloneSvg(schaltschrank: Schaltschrank): string | null {
  const svg = document.querySelector('svg') as SVGSVGElement | null
  if (!svg) return null
  const { width, height } = contentSize(schaltschrank)

  const clone = svg.cloneNode(true) as SVGSVGElement
  // Zoom/Pan-Transform der obersten Gruppe zurücksetzen
  const rootG = clone.querySelector('g')
  if (rootG) rootG.setAttribute('transform', 'translate(10,10)')
  // interaktive Vorschau-Elemente entfernen (Schatten etc. sind ohnehin leer)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width + 20))
  clone.setAttribute('height', String(height + 20))
  clone.setAttribute('viewBox', `0 0 ${width + 20} ${height + 20}`)
  // dunkler Hintergrund für Lesbarkeit
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bg.setAttribute('x', '0'); bg.setAttribute('y', '0')
  bg.setAttribute('width', String(width + 20)); bg.setAttribute('height', String(height + 20))
  bg.setAttribute('fill', '#0f172a')
  clone.insertBefore(bg, clone.firstChild)

  return new XMLSerializer().serializeToString(clone)
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

export function exportSVG(schaltschrank: Schaltschrank) {
  const svgStr = buildStandaloneSvg(schaltschrank)
  if (!svgStr) return
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${svgStr}`], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${schaltschrank.name.replace(/\s+/g, '_')}.svg`)
  URL.revokeObjectURL(url)
}

export function exportPNG(schaltschrank: Schaltschrank) {
  const svgStr = buildStandaloneSvg(schaltschrank)
  if (!svgStr) return
  const { width, height } = contentSize(schaltschrank)
  const scale = 2
  const img = new Image()
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = (width + 20) * scale
    canvas.height = (height + 20) * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    canvas.toBlob(blob => {
      if (!blob) return
      const pngUrl = URL.createObjectURL(blob)
      triggerDownload(pngUrl, `${schaltschrank.name.replace(/\s+/g, '_')}.png`)
      URL.revokeObjectURL(pngUrl)
    }, 'image/png')
  }
  img.src = url
}
