-- Cute Huang Messenger - Initial Schema
-- Run this in your Supabase SQL editor

-- ── Profiles ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  internal_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'New User',
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen   TIMESTAMPTZ,

  CONSTRAINT internal_id_format CHECK (internal_id ~ '^CHM[0-9]{7}$')
);

-- ── Chats ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('direct', 'ai')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat Participants ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_participants (
  chat_id   UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (chat_id, user_id)
);

-- ── Messages ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id     UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content     TEXT NOT NULL,
  is_ai       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_internal_id ON public.profiles(internal_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON public.messages(chat_id, created_at);

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, only update own
CREATE POLICY "Profiles are viewable by all users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Chats: visible to participants
CREATE POLICY "Users can view their chats" ON public.chats
  FOR SELECT USING (
    id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" ON public.chats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their chats" ON public.chats
  FOR UPDATE USING (
    id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

-- Chat participants: visible to those in the chat
CREATE POLICY "Participants can see chat members" ON public.chat_participants
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join chats" ON public.chat_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages: visible to participants
CREATE POLICY "Users can read messages in their chats" ON public.messages
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    chat_id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

-- ── Realtime ────────────────────────────────────────────────────────────────
-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;

-- ── Trigger: update chats.updated_at on new message ─────────────────────────
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats SET updated_at = NOW() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_updated_at();
