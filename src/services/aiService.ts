import type { AIMessage } from '@/types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string

const SYSTEM_PROMPT = `You are Huang AI, a warm, thoughtful, and eloquent AI assistant embedded inside Cute Huang Messenger — a premium global messaging platform. 

You are helpful, intelligent, and culturally aware. You can:
- Answer questions on any topic
- Help draft messages and communications
- Translate text between languages (English, Arabic, Chinese, Kurdish Sorani, Bengali)
- Provide thoughtful advice and creative suggestions
- Be a genuine, empathetic conversation partner

Keep your responses clear, well-structured, and appropriately concise. Use a warm but professional tone. When translating, always show both the original and translated text. Express genuine care for the user's wellbeing and goals.

You were created to make messaging more meaningful and intelligent.`

export async function sendToAI(
  messages: AIMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    // Demo response when no API key is configured
    return getDemoResponse(messages.at(-1)?.content ?? '')
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Groq API error: ${response.status} — ${(errorData as any)?.error?.message ?? 'Unknown error'}`
      )
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.'
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Groq API error')) throw error
      throw new Error('Failed to connect to AI service. Please check your connection.')
    }
    throw error
  }
}

function getDemoResponse(userMessage: string): Promise<string> {
  const msg = userMessage.toLowerCase()

  const responses: Array<{ triggers: string[]; response: string }> = [
    {
      triggers: ['hello', 'hi', 'hey', 'greetings'],
      response: `Hello! 👋 I'm **Huang AI**, your personal assistant in Cute Huang Messenger.\n\nI can help you with translations, answer questions, draft messages, and much more. What would you like to explore today?\n\n*Note: To enable full AI capabilities, please configure your Groq API key in the environment settings.*`,
    },
    {
      triggers: ['translate', 'translation', 'arabic', 'chinese', 'bengali'],
      response: `I can help with translations! I support:\n- 🇬🇧 English\n- 🇸🇦 Arabic\n- 🇨🇳 Chinese (Simplified)\n- 🏔️ Kurdish Sorani\n- 🇧🇩 Bengali\n\nJust tell me what you'd like translated and into which language.\n\n*Configure your Groq API key for live translation.*`,
    },
    {
      triggers: ['help', 'what can you do', 'features'],
      response: `Here's what I can help you with:\n\n**📝 Communication**\n- Draft messages & emails\n- Suggest how to phrase things\n\n**🌍 Languages**\n- Translate in real-time\n- Explain idioms & cultural context\n\n**💡 Knowledge**\n- Answer questions on any topic\n- Research and summarize information\n\n**🤝 Personal**\n- Be a thoughtful conversation partner\n- Offer advice and creative suggestions`,
    },
    {
      triggers: ['who are you', 'what are you', 'about you'],
      response: `I'm **Huang AI** — an intelligent assistant woven into the fabric of Cute Huang Messenger. 🌸\n\nI was designed to make your conversations more meaningful, help you communicate across languages, and be a thoughtful companion whenever you need one.\n\nCute Huang Messenger was crafted with care by **Danial Mohmad** — a premium platform built for genuine human connection.`,
    },
  ]

  const match = responses.find((r) =>
    r.triggers.some((trigger) => msg.includes(trigger))
  )

  const response =
    match?.response ??
    `Thank you for your message! I'm Huang AI, and I'm here to help.\n\nFor full AI capabilities including real-time answers, translations, and dynamic conversations, please configure your Groq API key in the **.env** file:\n\n\`\`\`\nVITE_GROQ_API_KEY=your_groq_api_key_here\n\`\`\`\n\nGet your free API key at **console.groq.com** — it's fast and free to start.`

  return new Promise((resolve) =>
    setTimeout(() => resolve(response), 800 + Math.random() * 600)
  )
}
