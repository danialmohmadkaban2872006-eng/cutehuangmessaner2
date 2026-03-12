import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Search, Settings, User, Sparkles, X, MessageCircle } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { useAuth } from '@/contexts/AuthContext'
import { getUserChats, getOrCreateDirectChat, getOrCreateAiChat } from '@/services/chatService'
import { getProfileByInternalId } from '@/services/authService'
import { formatTime, truncate } from '@/lib/utils'
import type { Chat } from '@/types'
import toast from 'react-hot-toast'

interface SidebarProps {
  onChatSelect?: (chatId: string) => void
}

export default function Sidebar({ onChatSelect }: SidebarProps) {
  const navigate = useNavigate()
  const { chatId: activeChatId } = useParams()
  const { user } = useAuth()

  const [chats, setChats] = useState<Chat[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatId, setNewChatId] = useState('')
  const [isSearchingUser, setIsSearchingUser] = useState(false)

  useEffect(() => {
    if (!user) return
    loadChats()
  }, [user])

  async function loadChats() {
    if (!user) return
    try {
      const userChats = await getUserChats(user.id)
      setChats(userChats)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOpenAiChat() {
    if (!user) return
    try {
      const chat = await getOrCreateAiChat(user.id)
      navigate(`/messenger/${chat.id}`)
      onChatSelect?.(chat.id)
      // Reload chats to reflect the AI chat
      loadChats()
    } catch (err) {
      toast.error('Failed to open AI chat')
    }
  }

  async function handleNewDirectChat() {
    if (!user || !newChatId.trim()) return
    if (newChatId.trim().toUpperCase() === user.internalId) {
      toast.error("You can't chat with yourself!")
      return
    }

    setIsSearchingUser(true)
    try {
      const otherUser = await getProfileByInternalId(newChatId.trim().toUpperCase())
      if (!otherUser) {
        toast.error('User not found. Check the ID and try again.')
        return
      }

      const chat = await getOrCreateDirectChat(user.id, otherUser.id)
      const chatWithParticipant: Chat = { ...chat, otherParticipant: otherUser }

      setChats((prev) => {
        const exists = prev.find((c) => c.id === chat.id)
        if (exists) return prev
        return [chatWithParticipant, ...prev]
      })

      navigate(`/messenger/${chat.id}`)
      onChatSelect?.(chat.id)
      setShowNewChat(false)
      setNewChatId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start chat')
    } finally {
      setIsSearchingUser(false)
    }
  }

  const filtered = chats.filter((c) => {
    if (!search) return true
    const name = c.type === 'ai' ? 'Huang AI' : (c.otherParticipant?.displayName ?? '')
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <aside className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3a3a6e, #ff1a4b)' }}>
            <span className="text-white text-sm">花</span>
          </div>
          <span className="font-display text-base font-medium" style={{ color: 'var(--text-primary)' }}>
            Huang
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/profile')}
            className="btn-ghost p-2 rounded-lg"
            title="Profile"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="btn-ghost p-2 rounded-lg"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input-field w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* AI Chat Button */}
      <div className="px-4 pb-3 flex-shrink-0">
        <button
          onClick={handleOpenAiChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
          style={{ background: 'linear-gradient(135deg, rgba(255,26,75,0.1), rgba(245,158,11,0.05))', border: '1px solid rgba(255,26,75,0.15)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,26,75,0.2), rgba(245,158,11,0.15))' }}>
            <Sparkles className="w-4 h-4 text-rose-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Huang AI</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your AI assistant</p>
          </div>
        </button>
      </div>

      {/* New Chat button */}
      <div className="px-4 pb-3 flex-shrink-0">
        {!showNewChat ? (
          <button
            onClick={() => setShowNewChat(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm btn-ghost justify-center"
            style={{ border: '1px dashed var(--border)' }}
          >
            <Plus className="w-4 h-4" />
            <span>New Chat by User ID</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              className="input-field flex-1 rounded-xl px-3 py-2 text-sm"
              placeholder="Enter CHM ID..."
              value={newChatId}
              onChange={(e) => setNewChatId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleNewDirectChat()}
              autoFocus
            />
            <button
              onClick={handleNewDirectChat}
              disabled={isSearchingUser || !newChatId}
              className="btn-primary px-3 rounded-xl text-sm flex-shrink-0"
            >
              {isSearchingUser ? '...' : 'Go'}
            </button>
            <button
              onClick={() => { setShowNewChat(false); setNewChatId('') }}
              className="btn-ghost px-2 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 h-px flex-shrink-0" style={{ background: 'var(--border)' }} />

      {/* Chats label */}
      <p className="px-4 pb-2 text-xs uppercase tracking-wider font-medium flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        Conversations
      </p>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {isLoading ? (
          <SidebarSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageCircle className="w-10 h-10 mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              {search ? 'No results' : 'No conversations'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Try a different search term' : 'Start a new chat above'}
            </p>
          </div>
        ) : (
          filtered.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              currentUserId={user?.id ?? ''}
              onClick={() => {
                navigate(`/messenger/${chat.id}`)
                onChatSelect?.(chat.id)
              }}
            />
          ))
        )}
      </div>

      {/* User Info Footer */}
      {user && (
        <div className="px-4 py-3 flex-shrink-0 flex items-center gap-3"
          style={{ borderTop: '1px solid var(--border)' }}>
          <Avatar name={user.displayName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {user.displayName}
            </p>
            <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>
              {user.internalId}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}

// ─── Chat Item ──────────────────────────────────────────────────────────────
function ChatItem({
  chat,
  isActive,
  currentUserId,
  onClick,
}: {
  chat: Chat
  isActive: boolean
  currentUserId: string
  onClick: () => void
}) {
  const isAi = chat.type === 'ai'
  const name = isAi ? 'Huang AI' : (chat.otherParticipant?.displayName ?? 'Unknown')
  const lastMsg = chat.lastMessage
  const lastMsgPreview = lastMsg
    ? truncate(lastMsg.content, 36)
    : 'No messages yet'
  const time = lastMsg ? formatTime(lastMsg.createdAt) : ''

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
        isActive ? 'chat-item-active' : 'hover:bg-white/5'
      }`}
    >
      {isAi ? (
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(255,26,75,0.3), rgba(245,158,11,0.2))' }}>
          <Sparkles className="w-4 h-4 text-rose-400" />
        </div>
      ) : (
        <Avatar name={name} size="sm" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {name}
          </p>
          {time && (
            <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
              {time}
            </span>
          )}
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
          {isAi && lastMsg?.isAi ? '✨ ' : ''}{lastMsgPreview}
        </p>
      </div>
    </button>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SidebarSkeleton() {
  return (
    <div className="space-y-1 px-2 pt-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
          <div className="w-9 h-9 rounded-full shimmer flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 shimmer rounded" />
            <div className="h-2.5 w-36 shimmer rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
