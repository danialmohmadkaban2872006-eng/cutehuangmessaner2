import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Moon, Sun, Globe, Bell, Volume2, LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LANGUAGE_LABELS } from '@/i18n'
import type { Language, Theme } from '@/types'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, settings, updateSettings, logout } = useAuth()

  async function handleLogout() {
    try {
      await logout()
      navigate('/', { replace: true })
      toast.success('Signed out successfully')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  function toggleTheme() {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
  }

  function setLanguage(lang: Language) {
    updateSettings({ language: lang })
    toast.success(`Language changed to ${LANGUAGE_LABELS[lang]}`)
  }

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-subtle px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8 space-y-5">
        {/* Account */}
        <SettingsSection title="Account">
          <div className="px-4 py-3 flex items-center gap-3">
            <Shield className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>User ID</p>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{user?.internalId}</p>
            </div>
          </div>
          <SettingsDivider />
          <button
            onClick={() => navigate('/profile')}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-4 h-4 flex-shrink-0 text-lg leading-none">👤</div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Edit Profile</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {user?.displayName} · Change name, bio
              </p>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </button>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? (
                <Moon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              ) : (
                <Sun className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              )}
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
                <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{settings.theme} mode</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="w-12 h-6 rounded-full relative transition-all flex-shrink-0"
              style={{
                background: settings.theme === 'dark'
                  ? 'linear-gradient(135deg, #3a3a6e, #ff1a4b)'
                  : '#e0e0e0',
              }}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-white shadow ${
                settings.theme === 'dark' ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
        </SettingsSection>

        {/* Language */}
        <SettingsSection title="Language">
          <div className="px-4 py-3 flex items-center gap-3 mb-2">
            <Globe className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Display Language
            </p>
          </div>
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {(Object.entries(LANGUAGE_LABELS) as [Language, string][]).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  settings.language === code
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <ToggleRow
            icon={<Bell className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
            label="Notifications"
            description="Receive message alerts"
            enabled={settings.notificationsEnabled}
            onToggle={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          />
          <SettingsDivider />
          <ToggleRow
            icon={<Volume2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
            label="Sound"
            description="Play sounds for messages"
            enabled={settings.soundEnabled}
            onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          />
        </SettingsSection>

        {/* Sign out */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(255,26,75,0.06)',
              border: '1px solid rgba(255,26,75,0.15)',
              color: '#ff1a4b',
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center pt-4 pb-2" style={{ color: 'var(--text-muted)' }}>
          Cute Huang Messenger v1.0
          <br />
          © 2024 Danial Mohmad. All rights reserved.
        </p>
      </div>
    </div>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider font-medium mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>
      <div className="glass-subtle rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SettingsDivider() {
  return <div className="mx-4 h-px" style={{ background: 'var(--border)' }} />
}

function ToggleRow({
  icon, label, description, enabled, onToggle,
}: {
  icon: React.ReactNode
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className="w-12 h-6 rounded-full relative transition-all flex-shrink-0"
        style={{
          background: enabled ? 'linear-gradient(135deg, #3a3a6e, #ff1a4b)' : 'var(--bg-tertiary)',
          border: enabled ? 'none' : '1px solid var(--border)',
        }}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-white shadow ${
          enabled ? 'left-6' : 'left-0.5'
        }`} />
      </button>
    </div>
  )
}

