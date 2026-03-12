import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/utils'
import type { Chat, Message, UserProfile } from '@/types'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

// ─── Chat Operations ──────────────────────────────────────────────────────────

export async function getUserChats(userId: string): Promise<Chat[]> {
  if (DEMO_MODE) return getDemoChats(userId)

  const { data, error } = await supabase
    .from('chat_participants')
    .select(`
      chat_id,
      chats (
        id, type, created_at, updated_at
      )
    `)
    .eq('user_id', userId)

  if (error || !data) return []

  const chats: Chat[] = []

  for (const row of data) {
    const chat = row.chats as any
    if (!chat) continue

    let otherParticipant: UserProfile | undefined
    if (chat.type === 'direct') {
      const { data: participants } = await supabase
        .from('chat_participants')
        .select('user_id, profiles(*)')
        .eq('chat_id', chat.id)
        .neq('user_id', userId)
        .single()

      if (participants) {
        const p = (participants as any).profiles
        if (p) {
          otherParticipant = {
            id: p.id,
            internalId: p.internal_id,
            displayName: p.display_name,
            avatarUrl: p.avatar_url,
            bio: p.bio,
            createdAt: p.created_at,
          }
        }
      }
    }

    const lastMsg = await getLastMessage(chat.id)

    chats.push({
      id: chat.id,
      type: chat.type,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
      otherParticipant,
      lastMessage: lastMsg ?? undefined,
    })
  }

  return chats.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export async function getOrCreateDirectChat(
  userId: string,
  otherUserId: string
): Promise<Chat> {
  if (DEMO_MODE) return createDemoDirectChat(userId, otherUserId)

  // Check if chat already exists between these two users
  const { data: existing } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', userId)

  if (existing) {
    for (const row of existing) {
      const { data: otherParticipant } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', row.chat_id)
        .eq('user_id', otherUserId)
        .single()

      if (otherParticipant) {
        const { data: chatData } = await supabase
          .from('chats')
          .select('*')
          .eq('id', row.chat_id)
          .eq('type', 'direct')
          .single()

        if (chatData) {
          return {
            id: chatData.id,
            type: 'direct',
            createdAt: chatData.created_at,
            updatedAt: chatData.updated_at,
          }
        }
      }
    }
  }

  // Create new direct chat
  const { data: newChat, error } = await supabase
    .from('chats')
    .insert({ type: 'direct' })
    .select('id, type, created_at, updated_at')
    .single()

  if (error || !newChat) throw new Error('Failed to create chat')

  await supabase.from('chat_participants').insert([
    { chat_id: newChat.id, user_id: userId },
    { chat_id: newChat.id, user_id: otherUserId },
  ])

  return {
    id: newChat.id,
    type: 'direct',
    createdAt: newChat.created_at,
    updatedAt: newChat.updated_at,
  }
}

export async function getOrCreateAiChat(userId: string): Promise<Chat> {
  if (DEMO_MODE) return getOrCreateDemoAiChat(userId)

  // Find existing AI chat for this user
  const { data: participants } = await supabase
    .from('chat_participants')
    .select('chat_id, chats!inner(id, type)')
    .eq('user_id', userId)

  if (participants) {
    const aiParticipant = participants.find(
      (p) => (p.chats as any)?.type === 'ai'
    )
    if (aiParticipant) {
      return {
        id: aiParticipant.chat_id,
        type: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  }

  // Create new AI chat
  const { data: newChat, error } = await supabase
    .from('chats')
    .insert({ type: 'ai' })
    .select()
    .single()

  if (error || !newChat) throw new Error('Failed to create AI chat')

  await supabase.from('chat_participants').insert({
    chat_id: newChat.id,
    user_id: userId,
  })

  return {
    id: newChat.id,
    type: 'ai',
    createdAt: newChat.created_at,
    updatedAt: newChat.updated_at,
  }
}

// ─── Message Operations ───────────────────────────────────────────────────────

export async function getChatMessages(chatId: string): Promise<Message[]> {
  if (DEMO_MODE) return getDemoMessages(chatId)

  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles:sender_id(id, internal_id, display_name, avatar_url)')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map((msg) => {
    const p = (msg as any).profiles
    return {
      id: msg.id,
      chatId: msg.chat_id,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      isAi: msg.is_ai,
      senderProfile: p
        ? {
            id: p.id,
            internalId: p.internal_id,
            displayName: p.display_name,
            avatarUrl: p.avatar_url,
            createdAt: '',
          }
        : undefined,
    }
  })
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  content: string,
  isAi = false
): Promise<Message> {
  if (DEMO_MODE) return sendDemoMessage(chatId, senderId, content, isAi)

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: isAi ? null : senderId,
      content,
      is_ai: isAi,
    })
    .select()
    .single()

  if (error || !data) throw new Error('Failed to send message')

  // Update chat's updated_at
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId)

  return {
    id: data.id,
    chatId: data.chat_id,
    senderId: data.sender_id,
    content: data.content,
    createdAt: data.created_at,
    isAi: data.is_ai,
  }
}

export async function getLastMessage(chatId: string): Promise<Message | null> {
  if (DEMO_MODE) {
    const messages = getDemoMessages(chatId)
    return messages.at(-1) ?? null
  }

  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null

  return {
    id: data.id,
    chatId: data.chat_id,
    senderId: data.sender_id,
    content: data.content,
    createdAt: data.created_at,
    isAi: data.is_ai,
  }
}

// Subscribe to new messages in real-time
export function subscribeToMessages(
  chatId: string,
  onMessage: (msg: Message) => void
) {
  if (DEMO_MODE) return () => {}

  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        const data = payload.new as any
        onMessage({
          id: data.id,
          chatId: data.chat_id,
          senderId: data.sender_id,
          content: data.content,
          createdAt: data.created_at,
          isAi: data.is_ai,
        })
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// ─── Demo Mode ────────────────────────────────────────────────────────────────

function getDemoChats(userId: string): Chat[] {
  const chats = storage.get<Chat[]>(`demo_chats_${userId}`) ?? []
  // Ensure AI chat exists
  if (!chats.find((c) => c.type === 'ai')) {
    const aiChat: Chat = {
      id: `ai_${userId}`,
      type: 'ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    chats.unshift(aiChat)
    storage.set(`demo_chats_${userId}`, chats)
  }
  return chats
}

function getOrCreateDemoAiChat(userId: string): Chat {
  const chats = getDemoChats(userId)
  const existing = chats.find((c) => c.type === 'ai')
  if (existing) return existing

  const aiChat: Chat = {
    id: `ai_${userId}`,
    type: 'ai',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  chats.unshift(aiChat)
  storage.set(`demo_chats_${userId}`, chats)
  return aiChat
}

function createDemoDirectChat(userId: string, otherUserId: string): Chat {
  const chatId = `direct_${[userId, otherUserId].sort().join('_')}`
  const chat: Chat = {
    id: chatId,
    type: 'direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const chats = storage.get<Chat[]>(`demo_chats_${userId}`) ?? []
  if (!chats.find((c) => c.id === chatId)) {
    chats.push(chat)
    storage.set(`demo_chats_${userId}`, chats)
  }
  return chat
}

function getDemoMessages(chatId: string): Message[] {
  return storage.get<Message[]>(`demo_msgs_${chatId}`) ?? []
}

function sendDemoMessage(
  chatId: string,
  senderId: string,
  content: string,
  isAi: boolean
): Message {
  const msg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    chatId,
    senderId: isAi ? null : senderId,
    content,
    createdAt: new Date().toISOString(),
    isAi,
  }
  const messages = getDemoMessages(chatId)
  messages.push(msg)
  storage.set(`demo_msgs_${chatId}`, messages)
  return msg
}
