import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth'

async function getNoteAndCheckUser(id: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id } })
  if (!note || note.userId !== userId) return null
  return note
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const note = await getNoteAndCheckUser(id, userId)
  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title : note.title
    const content = typeof body.content === 'string' ? body.content : note.content
    const updated = await prisma.note.update({
      where: { id },
      data: { title: title || '제목 없음', content },
    })
    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      content: updated.content,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (e) {
    console.error('Update note error:', e)
    return NextResponse.json(
      { error: '메모 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const note = await getNoteAndCheckUser(id, userId)
  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    await prisma.note.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete note error:', e)
    return NextResponse.json(
      { error: '메모 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
