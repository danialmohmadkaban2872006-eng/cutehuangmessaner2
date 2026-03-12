import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import CredentialCard from '@/components/ui/CredentialCard'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { register, user } = useAuth()

  const [step, setStep] = useState<'creating' | 'show-credentials' | 'done'>('creating')
  const [credentials, setCredentials] = useState<{ internalId: string; password: string } | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      // Already logged in, skip to messenger
      navigate('/messenger', { replace: true })
      return
    }
    handleCreateAccount()
  }, [])

  async function handleCreateAccount() {
    try {
      setIsLoading(true)
      const result = await register()
      setCredentials(result.credentials)
      setStep('show-credentials')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account')
      navigate('/', { replace: true })
    } finally {
      setIsLoading(false)
    }
  }

  function handleContinue() {
    if (!confirmed) {
      toast.error('Please confirm you have saved your credentials.')
      return
    }
    navigate('/messenger', { replace: true })
  }

  if (step === 'creating' || isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center stagger">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-3xl animate-pulse-soft"
              style={{ background: 'linear-gradient(135deg, #3a3a6e, #ff1a4b)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">花</span>
            </div>
          </div>
          <h2 className="font-display text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>
            Creating your account...
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Generating your unique identity
          </p>
          <div className="flex gap-1.5 justify-center mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-5 py-10">
      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3a3a6e, transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ff1a4b, transparent)' }} />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3a3a6e, #ff1a4b)' }}>
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Your account is ready 🌸
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We've generated a unique identity for you. Save these credentials — 
            they're the <strong className="text-amber-400">only way</strong> to access your account.
          </p>
        </div>

        {/* Credential Card */}
        {credentials && (
          <div className="mb-6">
            <CredentialCard
              internalId={credentials.internalId}
              password={credentials.password}
            />
          </div>
        )}

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <div
            className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: confirmed ? '#ff1a4b' : 'var(--bg-tertiary)',
              border: confirmed ? '2px solid #ff1a4b' : '2px solid var(--border)',
            }}
            onClick={() => setConfirmed(!confirmed)}
          >
            {confirmed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className="text-sm leading-relaxed select-none" style={{ color: 'var(--text-secondary)' }}
            onClick={() => setConfirmed(!confirmed)}>
            I have saved my User ID and password securely. I understand these cannot be recovered.
          </span>
        </label>

        {/* Continue button */}
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full rounded-2xl group"
          disabled={!confirmed}
        >
          <span>Enter Messenger</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Already have account */}
        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium transition-colors"
            style={{ color: '#ff1a4b' }}
          >
            Sign in instead
          </button>
        </p>
      </div>
    </div>
  )
}
