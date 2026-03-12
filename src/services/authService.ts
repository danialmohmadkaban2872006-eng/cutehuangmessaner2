import { supabase } from '@/lib/supabase'
import { generateInternalId, generatePassword, internalIdToEmail } from '@/lib/credentials'
import { storage } from '@/lib/utils'
import type { UserProfile, Credentials } from '@/types'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

/**
 * Creates a brand-new account with auto-generated credentials.
 * Returns the profile and the plaintext credentials (shown once to user).
 */
export async function createAccount(): Promise<{ profile: UserProfile; credentials: Credentials }> {
  const internalId = generateInternalId()
  const password = generatePassword()
  const email = internalIdToEmail(internalId)
  const displayName = `User ${internalId.slice(-4)}`

  if (DEMO_MODE) {
    return createDemoAccount(internalId, password, displayName)
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { internal_id: internalId, display_name: displayName },
    },
  })

  if (signUpError) throw new Error(signUpError.message)
  if (!authData.user) throw new Error('Account creation failed')

  const profile: UserProfile = {
    id: authData.user.id,
    internalId,
    displayName,
    createdAt: new Date().toISOString(),
  }

  // Insert into profiles table
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    internal_id: internalId,
    display_name: displayName,
    created_at: profile.createdAt,
  })

  if (profileError) {
    // Non-fatal: profile insert can be retried
    console.error('Profile insert error:', profileError)
  }

  // Create the AI assistant chat for this user
  await createAiChatForUser(authData.user.id)

  return { profile, credentials: { internalId, password } }
}

/**
 * Logs in with internal ID + password.
 */
export async function login(internalId: string, password: string): Promise<UserProfile> {
  if (DEMO_MODE) {
    return loginDemo(internalId, password)
  }

  const email = internalIdToEmail(internalId)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw new Error('Invalid credentials. Please check your ID and password.')
  if (!data.user) throw new Error('Login failed.')

  const profile = await getProfile(data.user.id)
  if (!profile) throw new Error('Profile not found.')

  return profile
}

/**
 * Logs out the current user.
 */
export async function logout(): Promise<void> {
  if (DEMO_MODE) {
    storage.remove('demo_session')
    return
  }
  await supabase.auth.signOut()
}

/**
 * Fetches a user's profile by Supabase UUID.
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (DEMO_MODE) {
    const session = storage.get<{ profile: UserProfile }>('demo_session')
    return session?.profile ?? null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

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

/**
 * Fetches a user profile by their internal ID (for search / add user by ID).
 */
export async function getProfileByInternalId(internalId: string): Promise<UserProfile | null> {
  if (DEMO_MODE) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('internal_id', internalId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    internalId: data.internal_id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url ?? undefined,
    bio: data.bio ?? undefined,
    createdAt: data.created_at,
  }
}

/**
 * Updates the current user's profile.
 */
export async function updateProfile(
  userId: string,
  updates: { displayName?: string; bio?: string }
): Promise<void> {
  if (DEMO_MODE) {
    const session = storage.get<{ profile: UserProfile }>('demo_session')
    if (session) {
      session.profile = { ...session.profile, ...updates }
      storage.set('demo_session', session)
    }
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: updates.displayName,
      bio: updates.bio,
      last_seen: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

/**
 * Restores session from Supabase or demo storage.
 */
export async function restoreSession(): Promise<UserProfile | null> {
  if (DEMO_MODE) {
    const session = storage.get<{ profile: UserProfile }>('demo_session')
    return session?.profile ?? null
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  return getProfile(session.user.id)
}

// ─── Demo Mode Helpers ────────────────────────────────────────────────────────

function createDemoAccount(
  internalId: string,
  password: string,
  displayName: string
): { profile: UserProfile; credentials: Credentials } {
  const profile: UserProfile = {
    id: `demo-${internalId}`,
    internalId,
    displayName,
    createdAt: new Date().toISOString(),
  }

  const accounts = storage.get<Record<string, { profile: UserProfile; passwordHash: string }>>('demo_accounts') ?? {}
  accounts[internalId] = { profile, passwordHash: password }
  storage.set('demo_accounts', accounts)
  storage.set('demo_session', { profile })

  return { profile, credentials: { internalId, password } }
}

function loginDemo(internalId: string, password: string): UserProfile {
  const accounts = storage.get<Record<string, { profile: UserProfile; passwordHash: string }>>('demo_accounts') ?? {}
  const account = accounts[internalId]

  if (!account || account.passwordHash !== password) {
    throw new Error('Invalid credentials. Please check your ID and password.')
  }

  storage.set('demo_session', { profile: account.profile })
  return account.profile
}

async function createAiChatForUser(userId: string): Promise<void> {
  try {
    const { data: chat } = await supabase
      .from('chats')
      .insert({ type: 'ai' })
      .select('id')
      .single()

    if (chat) {
      await supabase.from('chat_participants').insert({
        chat_id: chat.id,
        user_id: userId,
      })
    }
  } catch {}
}
