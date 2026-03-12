import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserProfile, AppSettings } from '@/types'
import {
  createAccount,
  login as loginService,
  logout as logoutService,
  restoreSession,
  updateProfile as updateProfileService,
} from '@/services/authService'
import { storage } from '@/lib/utils'
import { setLanguage } from '@/i18n'

interface AuthContextValue {
  user: UserProfile | null
  isLoading: boolean
  isFirstTime: boolean
  settings: AppSettings
  register: () => Promise<{ profile: UserProfile; credentials: { internalId: string; password: string } }>
  login: (internalId: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: { displayName?: string; bio?: string }) => Promise<void>
  updateSettings: (updates: Partial<AppSettings>) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  notificationsEnabled: true,
  soundEnabled: true,
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(() => {
    return storage.get<AppSettings>('app_settings') ?? DEFAULT_SETTINGS
  })

  useEffect(() => {
    const savedSettings = storage.get<AppSettings>('app_settings')
    if (savedSettings) {
      setSettings(savedSettings)
      setLanguage(savedSettings.language)
      if (savedSettings.theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        document.documentElement.classList.add('dark')
      }
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    restoreSession()
      .then((profile) => {
        setUser(profile)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const register = useCallback(async () => {
    const result = await createAccount()
    setUser(result.profile)
    setIsFirstTime(true)
    return result
  }, [])

  const login = useCallback(async (internalId: string, password: string) => {
    const profile = await loginService(internalId, password)
    setUser(profile)
  }, [])

  const logout = useCallback(async () => {
    await logoutService()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (updates: { displayName?: string; bio?: string }) => {
      if (!user) return
      await updateProfileService(user.id, updates)
      setUser((prev) => (prev ? { ...prev, ...updates } : prev))
    },
    [user]
  )

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      storage.set('app_settings', next)

      if (updates.theme !== undefined) {
        if (updates.theme === 'light') {
          document.documentElement.classList.remove('dark')
        } else {
          document.documentElement.classList.add('dark')
        }
      }

      if (updates.language !== undefined) {
        setLanguage(updates.language)
      }

      return next
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isFirstTime, settings, register, login, logout, updateProfile, updateSettings }}
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
