import React from 'react'
import { formatFullTime } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
}

// Simple markdown-like renderer for AI responses
function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n')
  return lines.map((line, i) => {
    // Bold
    const processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')

    return (
      <p key={i} className={i < lines.length - 1 ? 'mb-1' : ''}
        dangerouslySetInnerHTML={{ __html: processed || '&nbsp;' }} />
    )
  })
}

import { Sparkles } from 'lucide-react'

export default function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const isAi = message.isAi
  const senderName = message.senderProfile?.displayName ?? 'Unknown'

  return (
    <div className={`flex items-end gap-2.5 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isOwn && showAvatar ? (
        <div className="flex-shrink-0 mb-1">
          {isAi ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,26,75,0.3), rgba(245,158,11,0.2))' }}>
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            </div>
          ) : (
            <Avatar name={senderName} size="xs" />
          )}
        </div>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Bubble */}
      <div className={`max-w-[70%] md:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {isAi && !isOwn && (
          <p className="text-xs px-1 font-medium text-rose-400">✨ Huang AI</p>
        )}
        <div className={`px-4 py-3 text-sm leading-relaxed break-words ${
          isOwn ? 'bubble-sent' : isAi ? 'bubble-ai prose-message' : 'bubble-received'
        }`}>
          {isAi ? renderContent(message.content) : message.content}
        </div>
        <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
          {formatFullTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
