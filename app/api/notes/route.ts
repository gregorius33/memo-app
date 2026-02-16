import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(
    notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }))
  )
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title : ''
    const content = typeof body.content === 'string' ? body.content : ''
    const note = await prisma.note.create({
      data: { title, content, userId },
    })
    return NextResponse.json({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    })
  } catch (e) {
    console.error('Create note error:', e)
    return NextResponse.json(
      { error: '메모 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
