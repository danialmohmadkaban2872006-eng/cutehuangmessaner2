export interface UserProfile {
  id: string;
  internalId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  lastSeen?: string;
}

export interface Credentials {
  internalId: string;
  password: string;
}

export type ChatType = 'direct' | 'ai';

export interface Chat {
  id: string;
  type: ChatType;
  createdAt: string;
  updatedAt: string;
  otherParticipant?: UserProfile;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string | null;
  content: string;
  createdAt: string;
  isAi?: boolean;
  senderProfile?: UserProfile;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type Theme = 'dark' | 'light';
export type Language = 'en' | 'ar' | 'zh' | 'ku' | 'bn';

export interface AppSettings {
  theme: Theme;
  language: Language;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}
