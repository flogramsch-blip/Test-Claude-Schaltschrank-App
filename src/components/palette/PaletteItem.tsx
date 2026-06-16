import { useDraggable } from '@dnd-kit/core'
import type { ComponentDefinition } from '@/types/components'

interface Props {
  def: ComponentDefinition
}

export default function PaletteItem({ def }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${def.id}`,
    data: { definitionId: def.id },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2 rounded cursor-grab active:cursor-grabbing transition-colors select-none"
      style={{
        background: isDragging ? '#334155' : '#1e293b',
        border: '1px solid #334155',
        opacity: isDragging ? 0.5 : 1,
      }}
      title={def.description}
    >
      {/* Color swatch */}
      <div
        className="shrink-0 rounded"
        style={{ width: 8, height: 32, background: def.color }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-200 truncate">{def.shortName}</div>
        <div className="text-xs text-slate-500 truncate">{def.name}</div>
      </div>

      {/* TE badge */}
      <div
        className="shrink-0 text-xs font-mono font-bold px-1.5 py-0.5 rounded"
        style={{ background: '#f97316', color: '#000', fontSize: 10 }}
      >
        {def.teWidth} TE
      </div>
    </div>
  )
}
