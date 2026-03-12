import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Hash } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [internalId, setInternalId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ id?: string; password?: string }>({})

  function validate() {
    const e: typeof errors = {}
    if (!internalId.trim()) e.id = 'User ID is required'
    else if (!internalId.trim().startsWith('CHM')) e.id = 'ID should start with CHM'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    try {
      setIsLoading(true)
      await login(internalId.trim().toUpperCase(), password)
      navigate('/messenger', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-5">
      {/* Background orbs */}
      <div className="fixed top-1/3 right-1/3 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3a3a6e, transparent)' }} />
      <div className="fixed bottom-1/3 left-1/3 w-56 h-56 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ff1a4b, transparent)' }} />

      <div className="relative z-10 w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-block">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3a3a6e, #ff1a4b)' }}>
              <span className="text-white text-2xl">花</span>
            </div>
          </button>
          <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Sign in with your generated credentials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-subtle rounded-2xl p-6 space-y-4">
          <Input
            label="User ID"
            placeholder="CHM1234567"
            value={internalId}
            onChange={(e) => setInternalId(e.target.value.toUpperCase())}
            error={errors.id}
            icon={<Hash className="w-4 h-4" />}
            autoComplete="username"
            autoFocus
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Button
            type="submit"
            loading={isLoading}
            size="lg"
            className="w-full rounded-xl mt-2"
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          className="w-full btn-secondary py-3 rounded-xl text-sm font-medium"
        >
          Create New Account
        </button>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Your ID starts with <code className="font-mono gradient-text">CHM</code> followed by 7 digits
        </p>
      </div>
    </div>
  )
}
