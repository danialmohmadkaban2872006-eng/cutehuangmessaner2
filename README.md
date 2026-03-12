# 花 Cute Huang Messenger

> A premium AI-powered messaging platform with anonymous identity.  
> © 2024 Danial Mohmad. All rights reserved.

---

## ✨ Features

- **Anonymous Identity**: Auto-generated User ID + Password — no email or phone required
- **AI Assistant**: Built-in Huang AI powered by Groq (llama-3.1-8b-instant)
- **One-to-One Chats**: Message anyone by their CHM ID
- **Real-time Updates**: Supabase Realtime for live messages
- **Multilingual Ready**: English, Arabic, Chinese, Kurdish Sorani, Bengali
- **Premium Design**: Dark/light theme, glassmorphism, smooth animations
- **Demo Mode**: Works offline with localStorage — no backend required for testing

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd cute-huang-messenger
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your credentials:

| Variable | Where to get it | Required |
|----------|----------------|----------|
| `VITE_SUPABASE_URL` | [Supabase Dashboard](https://app.supabase.com) → Settings → API | For persistence |
| `VITE_SUPABASE_ANON_KEY` | Same page as above | For persistence |
| `VITE_GROQ_API_KEY` | [console.groq.com](https://console.groq.com) (free) | For live AI |

> **Demo Mode**: If Supabase vars are not set, the app runs in demo mode using localStorage. Messages persist locally only.

### 3. Set Up Database (if using Supabase)
1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → New Query
3. Paste and run the contents of `supabase/migrations/001_initial.sql`

### 4. Run
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## 🗄️ Architecture

```
Stack:
  Frontend:   React 18 + TypeScript + Vite
  Styling:    Tailwind CSS + custom design system
  Backend:    Supabase (Auth, PostgreSQL, Realtime)
  AI:         Groq API (llama-3.1-8b-instant)
  Routing:    React Router v6
  Animations: Framer Motion + CSS animations
  Toasts:     react-hot-toast

Identity Flow:
  1. User visits → generateInternalId() → "CHM4829103"
  2. generatePassword() → "Zx9@mK2#qP4s"  
  3. signUp with synthetic email: chm4829103@cutehuang.internal
  4. Profile inserted into Supabase
  5. Credentials shown to user ONCE — they must save them
  6. Future logins: internalId + password → reconstruct email → signIn
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── messenger/    # Sidebar, ChatWindow, MessageBubble
│   ├── ui/           # Button, Input, Avatar, CredentialCard, LoadingScreen
│   └── profile/      # Profile components
├── contexts/
│   └── AuthContext.tsx    # Auth state + settings management
├── i18n/
│   └── index.ts           # Translation system
├── lib/
│   ├── credentials.ts     # ID + password generation
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utilities
├── pages/
│   ├── LandingPage.tsx
│   ├── OnboardingPage.tsx
│   ├── LoginPage.tsx
│   ├── MessengerPage.tsx
│   ├── ProfilePage.tsx
│   └── SettingsPage.tsx
├── services/
│   ├── authService.ts     # Account creation, login, profile
│   ├── chatService.ts     # Chat + message CRUD
│   └── aiService.ts       # Groq API integration
└── types/
    └── index.ts           # TypeScript interfaces
```

---

## 🔐 Security Notes

- Passwords are hashed by Supabase Auth (bcrypt)
- The synthetic email format is an internal implementation detail — users never see it
- Row Level Security (RLS) ensures users can only see their own chats/messages
- The Groq API key is exposed client-side — for production, consider proxying through a Supabase Edge Function

---

## 🌍 Multilingual

Language-ready architecture in `src/i18n/index.ts`. Currently translated:
- ✅ English (full)
- 🔸 Arabic (partial)
- 🔸 Chinese (partial)
- 🔲 Kurdish Sorani (structure ready)
- 🔲 Bengali (structure ready)

---

## 🚢 Deployment

### Vercel (recommended)
```bash
npm i -g vercel
vercel
```
Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GROQ_API_KEY`

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
# Add env vars in Netlify dashboard
```

---

## ✅ Verification Checklist

- [ ] Landing page loads with hero, features, and footer
- [ ] "Get Started" creates account with auto-generated CHM ID + password
- [ ] Credentials are shown on onboarding screen with copy buttons
- [ ] Login works with generated credentials
- [ ] AI chat opens and responds (with or without Groq key)
- [ ] New chat can be started by entering a CHM User ID
- [ ] Messages persist across page reloads
- [ ] Profile page shows and allows editing display name + bio
- [ ] Settings: theme toggle, language selector, logout
- [ ] Responsive on mobile, tablet, desktop

---

*Built with ❤️ by Danial Mohmad*
