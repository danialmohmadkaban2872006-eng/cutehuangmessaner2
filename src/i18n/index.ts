// Internationalization structure for Cute Huang Messenger
// Supports: English, Arabic, Chinese, Kurdish Sorani, Bengali

export type Language = 'en' | 'ar' | 'zh' | 'ku' | 'bn'

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  zh: '中文',
  ku: 'کوردی',
  bn: 'বাংলা',
}

export const RTL_LANGUAGES: Language[] = ['ar', 'ku']

export type TranslationKey =
  | 'app.tagline'
  | 'app.name'
  | 'landing.hero.title'
  | 'landing.hero.subtitle'
  | 'landing.cta.getStarted'
  | 'landing.cta.login'
  | 'auth.login.title'
  | 'auth.login.idPlaceholder'
  | 'auth.login.passwordPlaceholder'
  | 'auth.login.submit'
  | 'auth.onboarding.title'
  | 'auth.onboarding.subtitle'
  | 'auth.onboarding.saveWarning'
  | 'auth.onboarding.continue'
  | 'messenger.newChat'
  | 'messenger.search'
  | 'messenger.aiAssistant'
  | 'messenger.typeMessage'
  | 'messenger.send'
  | 'messenger.noChats'
  | 'profile.title'
  | 'profile.displayName'
  | 'profile.bio'
  | 'profile.save'
  | 'settings.title'
  | 'settings.theme'
  | 'settings.language'
  | 'settings.logout'
  | 'common.copy'
  | 'common.copied'
  | 'common.error'
  | 'common.loading'

type Translations = Record<TranslationKey, string>

const en: Translations = {
  'app.tagline': 'Where every conversation becomes beautiful.',
  'app.name': 'Cute Huang Messenger',
  'landing.hero.title': 'Messages that\nMove the Heart',
  'landing.hero.subtitle':
    'A premium messenger with built-in AI, secure anonymous identity, and beautiful design. Connect meaningfully — no email, no phone required.',
  'landing.cta.getStarted': 'Get Started Free',
  'landing.cta.login': 'Sign In',
  'auth.login.title': 'Welcome back',
  'auth.login.idPlaceholder': 'Your User ID (e.g. CHM1234567)',
  'auth.login.passwordPlaceholder': 'Your password',
  'auth.login.submit': 'Sign In',
  'auth.onboarding.title': 'Your account is ready 🌸',
  'auth.onboarding.subtitle':
    'Save your credentials now. This is the only time your password will be shown.',
  'auth.onboarding.saveWarning':
    '⚠️ Write these down or copy them somewhere safe. You cannot recover a lost password.',
  'auth.onboarding.continue': 'I\'ve saved my credentials',
  'messenger.newChat': 'New Chat',
  'messenger.search': 'Search conversations...',
  'messenger.aiAssistant': 'Huang AI',
  'messenger.typeMessage': 'Type a message...',
  'messenger.send': 'Send',
  'messenger.noChats': 'No conversations yet.\nStart a new chat below.',
  'profile.title': 'Your Profile',
  'profile.displayName': 'Display Name',
  'profile.bio': 'About you',
  'profile.save': 'Save Changes',
  'settings.title': 'Settings',
  'settings.theme': 'Theme',
  'settings.language': 'Language',
  'settings.logout': 'Sign Out',
  'common.copy': 'Copy',
  'common.copied': 'Copied!',
  'common.error': 'Something went wrong',
  'common.loading': 'Loading...',
}

const ar: Partial<Translations> = {
  'app.name': 'ماسنجر هوانغ الجميل',
  'landing.hero.title': 'رسائل تُحرّك القلب',
  'landing.cta.getStarted': 'ابدأ مجاناً',
  'landing.cta.login': 'تسجيل الدخول',
  'messenger.typeMessage': 'اكتب رسالة...',
  'settings.logout': 'تسجيل الخروج',
}

const zh: Partial<Translations> = {
  'app.name': '可爱黄聊天器',
  'landing.hero.title': '感动心灵的信息',
  'landing.cta.getStarted': '免费开始',
  'landing.cta.login': '登录',
  'messenger.typeMessage': '输入消息...',
  'settings.logout': '退出登录',
}

const translations: Record<Language, Partial<Translations>> = {
  en,
  ar,
  zh,
  ku: {},
  bn: {},
}

let currentLanguage: Language = 'en'

export function setLanguage(lang: Language): void {
  currentLanguage = lang
  document.documentElement.lang = lang
  document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr'
}

export function t(key: TranslationKey): string {
  return (
    translations[currentLanguage]?.[key] ??
    translations.en[key] ??
    key
  )
}

export function getCurrentLanguage(): Language {
  return currentLanguage
}
