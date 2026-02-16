'use client'

import { Trash2 } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface NotesListProps {
  notes: Note[]
  selectedNote: Note | null
  onSelectNote: (note: Note) => void
  onDeleteNote: (id: string) => void
}

export default function NotesList({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
}: NotesListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-muted-foreground">메모가 없습니다</p>
          <p className="text-sm text-muted-foreground">새로운 메모를 만들어보세요</p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`group cursor-pointer rounded-lg border-2 transition-all ${
                selectedNote?.id === note.id
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-border bg-card hover:border-accent'
              }`}
              onClick={() => onSelectNote(note)}
            >
              <div className="flex items-start justify-between gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <h3
                    className={`truncate font-semibold ${
                      selectedNote?.id === note.id
                        ? 'text-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {note.title || '제목 없음'}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {note.content || '내용 없음'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {note.updatedAt.toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteNote(note.id)
                  }}
                  className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
