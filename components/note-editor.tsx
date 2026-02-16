'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface NoteEditorProps {
  note: Note
  onSave: (title: string, content: string) => void
  onCancel: () => void
}

export default function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)

  const handleSave = () => {
    onSave(title, content)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="flex-1 text-3xl font-bold bg-transparent text-foreground placeholder-muted-foreground outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-lg bg-primary p-3 text-primary-foreground transition-all hover:shadow-md active:scale-95"
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              onClick={onCancel}
              className="rounded-lg bg-muted p-3 text-muted-foreground transition-all hover:shadow-md active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용을 입력하세요..."
        className="flex-1 resize-none bg-background p-6 text-foreground placeholder-muted-foreground outline-none"
      />
    </div>
  )
}
