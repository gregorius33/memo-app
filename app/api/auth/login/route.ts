import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { verifyPassword, createToken, getSessionCookieOptions } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: { email: ['이메일 또는 비밀번호가 올바르지 않습니다'] } },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: { email: ['이메일 또는 비밀번호가 올바르지 않습니다'] } },
        { status: 401 }
      )
    }

    const token = await createToken({ userId: user.id, email: user.email })
    const opts = getSessionCookieOptions()
    const cookieStore = await cookies()
    cookieStore.set(opts.name, token, opts)

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json(
      { error: { _form: ['로그인 중 오류가 발생했습니다'] } },
      { status: 500 }
    )
  }
}
