import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Sparkles, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import MessageBubble from './MessageBubble'
import Avatar from '@/components/ui/Avatar'
import {
  getChatMessages,
  sendMessage,
  subscribeToMessages,
} from '@/services/chatService'
import { sendToAI } from '@/services/aiService'
import { formatDate } from '@/lib/utils'
import type { Chat, Message, AIMessage } from '@/types'
import toast from 'react-hot-toast'

interface ChatWindowProps {
  chat: Chat
  onBack?: () => void
}

export default function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [aiHistory, setAiHistory] = useState<AIMessage[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isAiChat = chat.type === 'ai'
  const chatName = isAiChat
    ? 'Huang AI'
    : (chat.otherParticipant?.displayName ?? 'Unknown')

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load messages
  useEffect(() => {
    setIsLoading(true)
    getChatMessages(chat.id)
      .then((msgs) => {
        setMessages(msgs)
        // Reconstruct AI history
        if (isAiChat) {
          const hist: AIMessage[] = msgs.map((m) => ({
            role: m.isAi ? 'assistant' : 'user',
            content: m.content,
          }))
          setAiHistory(hist)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [chat.id])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, isAiTyping])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToMessages(chat.id, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
    })
    return unsubscribe
  }, [chat.id])

  async function handleSend() {
    if (!user || !input.trim() || isSending) return
    const content = input.trim()
    setInput('')
    setIsSending(true)

    try {
      // Optimistic update
      const optimisticMsg: Message = {
        id: `optimistic_${Date.now()}`,
        chatId: chat.id,
        senderId: user.id,
        content,
        createdAt: new Date().toISOString(),
        isAi: false,
      }
      setMessages((prev) => [...prev, optimisticMsg])

      const sent = await sendMessage(chat.id, user.id, content, false)

      // Replace optimistic message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? sent : m))
      )

      // Handle AI response
      if (isAiChat) {
        setIsAiTyping(true)
        const newHistory: AIMessage[] = [
          ...aiHistory,
          { role: 'user', content },
        ]
        setAiHistory(newHistory)

        const aiReply = await sendToAI(newHistory)

        const aiMsg = await sendMessage(chat.id, user.id, aiReply, true)
        setMessages((prev) => [...prev, aiMsg])
        setAiHistory((prev) => [...prev, { role: 'assistant', content: aiReply }])
        setIsAiTyping(false)
      }
    } catch (err) {
      toast.error('Failed to send message')
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('optimistic_')))
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const grouped = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        {onBack && (
          <button onClick={onBack} className="btn-ghost p-2 rounded-lg md:hidden">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {isAiChat ? (
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,26,75,0.3), rgba(245,158,11,0.2))' }}>
            <Sparkles className="w-5 h-5 text-rose-400" />
          </div>
        ) : (
          <Avatar name={chatName} size="sm" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {chatName}
          </p>
          {isAiChat ? (
            <p className="text-xs gradient-text-rose font-medium">Powered by Groq AI</p>
          ) : (
            chat.otherParticipant && (
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {chat.otherParticipant.internalId}
              </p>
            )
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-chat">
        {isLoading ? (
          <MessagesSkeleton />
        ) : messages.length === 0 ? (
          <EmptyChat isAi={isAiChat} chatName={chatName} />
        ) : (
          <>
            {grouped.map(({ date, msgs }) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs px-3 py-1 rounded-full glass-subtle" style={{ color: 'var(--text-muted)' }}>
                    {date}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                {msgs.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === user?.id && !msg.isAi}
                    showAvatar={
                      idx === 0 || msgs[idx - 1]?.senderId !== msg.senderId
                    }
                  />
                ))}
              </div>
            ))}

            {isAiTyping && (
              <div className="flex items-end gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(255,26,75,0.3), rgba(245,158,11,0.2))' }}>
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="bubble-ai px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              // Auto-resize
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder={isAiChat ? 'Ask Huang AI anything...' : 'Type a message...'}
            className="input-field flex-1 rounded-2xl px-4 py-3 text-sm resize-none leading-relaxed"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="btn-primary w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyChat({ isAi, chatName }: { isAi: boolean; chatName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16">
      {isAi ? (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(255,26,75,0.2), rgba(245,158,11,0.15))' }}>
            <Sparkles className="w-7 h-7 text-rose-400" />
          </div>
          <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Hello! I'm Huang AI ✨
          </h3>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Ask me anything — translate languages, draft messages, answer questions, or just have a conversation.
          </p>
          <div className="flex flex-wrap gap-2 mt-5 justify-center max-w-xs">
            {['Translate "I love you" to Arabic', 'Help me write a message', 'What can you do?'].map((s) => (
              <span key={s} className="text-xs px-3 py-1.5 rounded-full glass-subtle cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}>
                {s}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-2xl"
            style={{ background: 'var(--bg-tertiary)' }}>
            💬
          </div>
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Start a conversation
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Send a message to {chatName}
          </p>
        </>
      )}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function MessagesSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      {[
        { isOwn: false, width: 'w-48' },
        { isOwn: true, width: 'w-36' },
        { isOwn: false, width: 'w-56' },
        { isOwn: true, width: 'w-28' },
      ].map((item, i) => (
        <div key={i} className={`flex ${item.isOwn ? 'justify-end' : 'justify-start'}`}>
          {!item.isOwn && <div className="w-8 h-8 rounded-full shimmer mr-2.5 flex-shrink-0" />}
          <div className={`${item.width} h-10 shimmer rounded-2xl`} />
        </div>
      ))}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function groupMessagesByDate(messages: Message[]): { date: string; msgs: Message[] }[] {
  const groups: Map<string, Message[]> = new Map()

  for (const msg of messages) {
    const date = formatDate(msg.createdAt)
    if (!groups.has(date)) groups.set(date, [])
    groups.get(date)!.push(msg)
  }

  return Array.from(groups.entries()).map(([date, msgs]) => ({ date, msgs }))
}
