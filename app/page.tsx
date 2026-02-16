'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import NotesList from '@/components/notes-list'
import NoteEditor from '@/components/note-editor'
import Header from '@/components/header'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

function parseNote(n: { id: string; title: string; content: string; createdAt: string; updatedAt: string }): Note {
  return {
    ...n,
    createdAt: new Date(n.createdAt),
    updatedAt: new Date(n.updatedAt),
  }
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes')
      if (!res.ok) throw new Error('메모를 불러올 수 없습니다')
      const data = await res.json()
      setNotes(data.map(parseNote))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '메모를 불러오는데 실패했습니다')
      setNotes([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleCreateNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '', content: '' }),
      })
      if (!res.ok) throw new Error('메모 생성에 실패했습니다')
      const data = await res.json()
      const newNote = parseNote(data)
      setNotes((prev) => [newNote, ...prev])
      setSelectedNote(newNote)
      setIsEditing(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '메모 생성에 실패했습니다')
    }
  }

  const handleSaveNote = async (title: string, content: string) => {
    if (!selectedNote) return
    try {
      const res = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || '제목 없음', content }),
      })
      if (!res.ok) throw new Error('저장에 실패했습니다')
      const data = await res.json()
      const updated = parseNote(data)
      setNotes((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      )
      setSelectedNote(updated)
      setIsEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다')
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('삭제에 실패했습니다')
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(null)
        setIsEditing(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제에 실패했습니다')
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(false)
  }

  return (
    <main className="flex h-screen flex-col bg-background">
      <Header />
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm text-center">
          {error}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full border-r border-border bg-background md:w-80">
          <div className="flex flex-col h-full">
            <div className="border-b border-border p-4">
              <button
                onClick={handleCreateNote}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-all hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                새 메모
              </button>
            </div>
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <p className="text-muted-foreground">메모 불러오는 중...</p>
              </div>
            ) : (
              <NotesList
                notes={notes}
                selectedNote={selectedNote}
                onSelectNote={handleSelectNote}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </div>
        </div>

        <div className="hidden flex-1 flex-col md:flex">
          {selectedNote ? (
            isEditing ? (
              <NoteEditor
                note={selectedNote}
                onSave={handleSaveNote}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="border-b border-border bg-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-foreground">
                        {selectedNote.title || '제목 없음'}
                      </h1>
                      <p className="mt-2 text-sm text-muted-foreground">
                        수정됨: {selectedNote.updatedAt.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg bg-secondary p-3 text-secondary-foreground transition-all hover:shadow-md active:scale-95"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        className="rounded-lg bg-destructive p-3 text-destructive-foreground transition-all hover:shadow-md active:scale-95"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {selectedNote.content}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-flex rounded-full bg-secondary p-4">
                  <Plus className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  메모를 선택해주세요
                </h2>
                <p className="mt-2 text-muted-foreground">
                  좌측 목록에서 메모를 선택하거나 새로 만들어보세요
                </p>
              </div>
            </div>
          )}
        </div>

        {isEditing && selectedNote && (
          <div className="absolute inset-0 z-50 flex flex-col bg-background md:hidden">
            <div className="flex items-center justify-between border-b border-border bg-card p-4">
              <h2 className="font-semibold text-foreground">메모 편집</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}
      </div>
    </main>
  )
}
