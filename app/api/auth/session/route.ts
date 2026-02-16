import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { verifyToken, getSessionCookieOptions } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(getSessionCookieOptions().name)?.value
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    })
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
