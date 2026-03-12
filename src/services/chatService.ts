import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/utils'
import type { Chat, Message, UserProfile } from '@/types'

const DEMO_MODE =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getProfileByUserId(userId: string): Promise<UserProfile | undefined> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!data) return undefined

  return {
    id: data.id,
    internalId: data.internal_id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url ?? undefined,
    bio: data.bio ?? undefined,
    createdAt: data.created_at,
    lastSeen: data.last_seen ?? undefined,
  }
}

async function getChatRow(chatId: string) {
  const { data } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single()

  return data ?? null
}

// ─── Chat Operations ──────────────────────────────────────────────────────────

export async function getUserChats(userId: string): Promise<Chat[]> {
  if (DEMO_MODE) return getDemoChats(userId)

  const { data: participantRows, error } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', userId)

  if (error || !participantRows) return []

  const chats: Chat[] = []

  for (const row of participantRows) {
    const chat = await getChatRow(row.chat_id)
    if (!chat) continue

    let otherParticipant: UserProfile | undefined

    if (chat.type === 'direct') {
      const { data: others } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chat.id)
        .neq('user_id', userId)

      const otherUserId = others?.[0]?.user_id
      if (otherUserId) {
        otherParticipant = await getProfileByUserId(otherUserId)
      }
    }

    const lastMessage = await getLastMessage(chat.id)

    chats.push({
      id: chat.id,
      type: chat.type,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
      otherParticipant,
      lastMessage: lastMessage ?? undefined,
    })
  }

  return chats.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export async function getChatById(
  chatId: string,
  currentUserId: string
): Promise<Chat | null> {
  if (DEMO_MODE) {
    const chats = getDemoChats(currentUserId)
    return chats.find((c) => c.id === chatId) ?? null
  }

  const chat = await getChatRow(chatId)
  if (!chat) return null

  let otherParticipant: UserProfile | undefined

  if (chat.type === 'direct') {
    const { data: others } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('chat_id', chat.id)
      .neq('user_id', currentUserId)

    const otherUserId = others?.[0]?.user_id
    if (otherUserId) {
      otherParticipant = await getProfileByUserId(otherUserId)
    }
  }

  const lastMessage = await getLastMessage(chat.id)

  return {
    id: chat.id,
    type: chat.type,
    createdAt: chat.created_at,
    updatedAt: chat.updated_at,
    otherParticipant,
    lastMessage: lastMessage ?? undefined,
  }
}

export async function getOrCreateDirectChat(
  userId: string,
  otherUserId: string
): Promise<Chat> {
  if (DEMO_MODE) return createDemoDirectChat(userId, otherUserId)

  // 1) Try to find an existing direct chat shared by both users
  const { data: myRows } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', userId)

  if (myRows?.length) {
    for (const row of myRows) {
      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', row.chat_id)
        .eq('type', 'direct')
        .single()

      if (!chat) continue

      const { data: otherRow } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', row.chat_id)
        .eq('user_id', otherUserId)
        .single()

      if (otherRow) {
        const otherParticipant = await getProfileByUserId(otherUserId)
        return {
          id: chat.id,
          type: 'direct',
          createdAt: chat.created_at,
          updatedAt: chat.updated_at,
          otherParticipant,
        }
      }
    }
  }

  // 2) Create a new direct chat
  const { data: insertedChat, error: chatInsertError } = await supabase
    .from('chats')
    .insert({ type: 'direct' })
    .select('*')
    .single()

  if (chatInsertError || !insertedChat) {
    throw new Error(chatInsertError?.message || 'Failed to create chat')
  }

  const { error: participantsError } = await supabase
    .from('chat_participants')
    .insert([
      { chat_id: insertedChat.id, user_id: userId },
      { chat_id: insertedChat.id, user_id: otherUserId },
    ])

  if (participantsError) {
    throw new Error(participantsError.message || 'Failed to add chat participants')
  }

  const otherParticipant = await getProfileByUserId(otherUserId)

  return {
    id: insertedChat.id,
    type: 'direct',
    createdAt: insertedChat.created_at,
    updatedAt: insertedChat.updated_at,
    otherParticipant,
  }
}

export async function getOrCreateAiChat(userId: string): Promise<Chat> {
  if (DEMO_MODE) return getOrCreateDemoAiChat(userId)

  // 1) Look for an existing AI chat
  const { data: myRows } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', userId)

  if (myRows?.length) {
    for (const row of myRows) {
      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', row.chat_id)
        .eq('type', 'ai')
        .single()

      if (chat) {
        return {
          id: chat.id,
          type: 'ai',
          createdAt: chat.created_at,
          updatedAt: chat.updated_at,
        }
      }
    }
  }

  // 2) Create a new AI chat
  const { data: insertedChat, error: chatInsertError } = await supabase
    .from('chats')
    .insert({ type: 'ai' })
    .select('*')
    .single()

  if (chatInsertError || !insertedChat) {
    throw new Error(chatInsertError?.message || 'Failed to create AI chat')
  }

  const { error: participantError } = await supabase
    .from('chat_participants')
    .insert({
      chat_id: insertedChat.id,
      user_id: userId,
    })

  if (participantError) {
    throw new Error(participantError.message || 'Failed to attach AI chat to user')
  }

  return {
    id: insertedChat.id,
    type: 'ai',
    createdAt: insertedChat.created_at,
    updatedAt: insertedChat.updated_at,
  }
}

// ─── Message Operations ───────────────────────────────────────────────────────

export async function getChatMessages(chatId: string): Promise<Message[]> {
  if (DEMO_MODE) return getDemoMessages(chatId)

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  const senderIds = Array.from(
    new Set(data.map((m) => m.sender_id).filter(Boolean))
  ) as string[]

  const senderMap = new Map<string, UserProfile>()

  if (senderIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', senderIds)

    for (const p of profiles ?? []) {
      senderMap.set(p.id, {
        id: p.id,
        internalId: p.internal_id,
        displayName: p.display_name,
        avatarUrl: p.avatar_url ?? undefined,
        bio: p.bio ?? undefined,
        createdAt: p.created_at,
        lastSeen: p.last_seen ?? undefined,
      })
    }
  }

  return data.map((msg) => ({
    id: msg.id,
    chatId: msg.chat_id,
    senderId: msg.sender_id,
    content: msg.content,
    createdAt: msg.created_at,
    isAi: msg.is_ai,
    senderProfile: msg.sender_id ? senderMap.get(msg.sender_id) : undefined,
  }))
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  content: string,
  isAi = false
): Promise<Message> {
  if (DEMO_MODE) return sendDemoMessage(chatId, senderId, content, isAi)

  const trimmed = content.trim()
  if (!trimmed) throw new Error('Message is empty')

  // Verify the sender belongs to the chat for non-AI messages
  if (!isAi) {
    const { data: participant, error: participantError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('chat_id', chatId)
      .eq('user_id', senderId)
      .single()

    if (participantError || !participant) {
      throw new Error('You are not a participant in this chat yet')
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: isAi ? null : senderId,
      content: trimmed,
      is_ai: isAi,
    })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to send message')
  }

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
    return messages[messages.length - 1] ?? null
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
