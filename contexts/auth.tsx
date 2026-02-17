'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export type User = { id: string; email: string; name: string | null }

/** 로그인 상태에서 일정 시간(분) 동안 활동이 없으면 자동 로그아웃 */
const IDLE_LOGOUT_MINUTES = 30

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: Record<string, string[]> }>
  signup: (email: string, password: string, name?: string) => Promise<{ error?: Record<string, string[]> }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error ?? { _form: ['로그인에 실패했습니다'] } }
      await refreshSession()
      return {}
    },
    [refreshSession]
  )

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error ?? { _form: ['회원가입에 실패했습니다'] } }
      return {}
    },
    []
  )

  const logout = useCallback(async () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/login'
  }, [])

  // 로그인 상태에서 일정 시간 무활동 시 자동 로그아웃
  useEffect(() => {
    if (!user) return

    const scheduleIdleLogout = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        logout()
      }, IDLE_LOGOUT_MINUTES * 60 * 1000)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    scheduleIdleLogout()
    events.forEach((ev) => window.addEventListener(ev, scheduleIdleLogout))
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      events.forEach((ev) => window.removeEventListener(ev, scheduleIdleLogout))
    }
  }, [user, logout])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
