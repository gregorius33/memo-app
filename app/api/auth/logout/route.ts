import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionCookieOptions } from '@/lib/auth'

export async function POST() {
  const opts = getSessionCookieOptions()
  const cookieStore = await cookies()
  cookieStore.delete(opts.name)
  return NextResponse.json({ success: true })
}
