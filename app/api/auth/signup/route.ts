import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요').optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const { email, password, name } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: { email: ['이미 사용 중인 이메일입니다'] } },
        { status: 409 }
      )
    }

    const hashed = await hashPassword(password)
    await prisma.user.create({
      data: { email, password: hashed, name: name || null },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Signup error:', e)
    const message =
      e && typeof e === 'object' && 'message' in e && typeof (e as Error).message === 'string'
        ? (e as Error).message
        : ''
    const isDbError =
      /table|database|sqlite|prisma|P1001|P2021|ENOENT/i.test(message) || message.includes('exist')
    const userMessage = isDbError
      ? '데이터베이스가 준비되지 않았습니다. 터미널에서 "npx prisma db push"를 실행한 뒤 다시 시도해주세요.'
      : '회원가입 중 오류가 발생했습니다.'
    return NextResponse.json(
      { error: { _form: [userMessage] } },
      { status: 500 }
    )
  }
}
