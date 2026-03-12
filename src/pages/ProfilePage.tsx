import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Save, Copy, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { copyToClipboard } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  if (!user) return null

  async function handleSave() {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty')
      return
    }
    setIsSaving(true)
    try {
      await updateProfile({ displayName: displayName.trim(), bio: bio.trim() })
      setIsEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCopyId() {
    await copyToClipboard(user.internalId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
    toast.success('User ID copied!')
  }

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-subtle px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
          Your Profile
        </h1>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-ghost p-2 rounded-xl">
            <Edit3 className="w-4 h-4" />
          </button>
        ) : (
          <Button size="sm" onClick={handleSave} loading={isSaving}>
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
        )}
      </div>

      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <Avatar name={user.displayName} size="xl" className="mb-4" />
          <h2 className="font-display text-2xl font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {user.displayName}
          </h2>
          {user.bio && (
            <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
              {user.bio}
            </p>
          )}
        </div>

        {/* User ID card */}
        <div className="glass-subtle rounded-2xl p-5 mb-5">
          <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
            Your User ID
          </p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <code className="flex-1 font-mono text-lg tracking-widest gradient-text font-semibold">
              {user.internalId}
            </code>
            <button onClick={handleCopyId} className="p-2 rounded-lg transition-all btn-ghost">
              {copiedId ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Share this ID so others can message you
          </p>
        </div>

        {/* Edit form */}
        {isEditing ? (
          <div className="glass-subtle rounded-2xl p-5 space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you appear to others"
              maxLength={32}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                About you
              </label>
              <textarea
                className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short description about yourself..."
                rows={3}
                maxLength={160}
              />
              <p className="text-right text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {bio.length}/160
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={isSaving} className="flex-1">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass-subtle rounded-2xl p-5 space-y-4">
            <ProfileRow label="Display Name" value={user.displayName} />
            <ProfileRow label="Bio" value={user.bio ?? 'No bio yet'} muted={!user.bio} />
            <ProfileRow
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            />
          </div>
        )}

        {/* Navigate to settings */}
        <button
          onClick={() => navigate('/settings')}
          className="w-full mt-4 btn-ghost py-3 rounded-xl text-sm"
          style={{ border: '1px solid var(--border)' }}
        >
          ⚙️ Go to Settings
        </button>
      </div>
    </div>
  )
}

function ProfileRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className={`text-sm ${muted ? 'italic' : ''}`}
        style={{ color: muted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  )
}
