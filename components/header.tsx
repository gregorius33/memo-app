'use client'

import Link from 'next/link'
import { Lightbulb, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth'

export default function Header() {
  const { user, isLoading, logout } = useAuth()

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">나의 메모</h1>
            <p className="text-sm text-muted-foreground">
              생각을 정리하고 아이디어를 기록하세요
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : user ? (
            <>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user.name || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="gap-1.5"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
