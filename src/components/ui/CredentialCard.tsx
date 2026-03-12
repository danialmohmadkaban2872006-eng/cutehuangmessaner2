import { useState } from 'react'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CredentialCardProps {
  internalId: string
  password: string
}

export default function CredentialCard({ internalId, password }: CredentialCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPw, setCopiedPw] = useState(false)

  const handleCopy = async (text: string, type: 'id' | 'pw') => {
    await copyToClipboard(text)
    if (type === 'id') {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } else {
      setCopiedPw(true)
      setTimeout(() => setCopiedPw(false), 2000)
    }
    toast.success(`${type === 'id' ? 'User ID' : 'Password'} copied!`)
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(58,58,110,0.4) 0%, rgba(255,26,75,0.1) 100%)' }}>
        <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center">
          <span className="text-rose-400 text-base">🔐</span>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Your Credentials</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Keep these safe — they cannot be recovered</p>
        </div>
      </div>

      {/* Fields */}
      <div className="px-5 py-4 space-y-3" style={{ background: 'var(--bg-tertiary)' }}>
        {/* User ID */}
        <div>
          <p className="text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            User ID
          </p>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <code className="flex-1 font-mono text-base font-medium tracking-widest" style={{ color: 'var(--text-primary)' }}>
              {internalId}
            </code>
            <button
              onClick={() => handleCopy(internalId, 'id')}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-muted)' }}
              title="Copy User ID"
            >
              {copiedId ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 hover:text-rose-400 transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <p className="text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Password
          </p>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <code className="flex-1 font-mono text-base font-medium tracking-widest" style={{ color: 'var(--text-primary)' }}>
              {showPassword ? password : '●'.repeat(password.length)}
            </code>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                title="Toggle visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 hover:text-rose-400 transition-colors" />
                ) : (
                  <Eye className="w-4 h-4 hover:text-rose-400 transition-colors" />
                )}
              </button>
              <button
                onClick={() => handleCopy(password, 'pw')}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                title="Copy password"
              >
                {copiedPw ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 hover:text-rose-400 transition-colors" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="px-5 py-3.5 flex items-start gap-2.5"
        style={{ background: 'rgba(255,26,75,0.06)', borderTop: '1px solid rgba(255,26,75,0.12)' }}>
        <span className="text-amber-400 mt-0.5 flex-shrink-0">⚠️</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          This is the <strong className="text-amber-400">only time</strong> your password will be displayed.
          Write it down or save it securely. There is no account recovery.
        </p>
      </div>
    </div>
  )
}
