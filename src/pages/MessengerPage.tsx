import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import Sidebar from '@/components/messenger/Sidebar'
import ChatWindow from '@/components/messenger/ChatWindow'
import { useAuth } from '@/contexts/AuthContext'
import { getChatById } from '@/services/chatService'
import type { Chat } from '@/types'

export default function MessengerPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    async function loadActiveChat() {
      if (!chatId || !user) {
        setActiveChat(null)
        if (isMobile) setShowSidebar(true)
        return
      }

      const chat = await getChatById(chatId, user.id)
      setActiveChat(chat)

      if (isMobile) setShowSidebar(false)
    }

    loadActiveChat()
  }, [chatId, user])

  function handleBack() {
    setActiveChat(null)
    setShowSidebar(true)
    navigate('/messenger', { replace: true })
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div
        className={`
          ${isMobile ? (showSidebar ? 'w-full' : 'hidden') : 'w-72 flex-shrink-0'}
          h-full
        `}
      >
        <Sidebar onChatSelect={() => isMobile && setShowSidebar(false)} />
      </div>

      <div
        className={`
          flex-1 h-full
          ${isMobile && showSidebar ? 'hidden' : 'flex flex-col'}
        `}
      >
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            onBack={isMobile ? handleBack : undefined}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  )
}

function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-chat">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(58,58,110,0.2), rgba(255,26,75,0.1))' }}
      >
        <MessageCircle className="w-9 h-9" style={{ color: 'var(--text-muted)' }} />
      </div>
      <h2 className="font-display text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>
        Select a conversation
      </h2>
      <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Choose a conversation from the sidebar or start a new one by entering a User ID.
      </p>
    </div>
  )
}
