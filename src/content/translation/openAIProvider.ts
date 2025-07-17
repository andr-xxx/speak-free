import type { TranslationProvider } from './translationService';

declare const OPENAI_API_KEY: string;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const openAIProvider: TranslationProvider = {
async translate(text: string, targetLang: string) {
    const prompt = `Translate the following text to ${targetLang} (only return the translation, no explanation, and preserve the text formatting if possible). Return only the translation, without any extra quotes, code blocks, or formatting wrappers:\n${text}`;
    const body = {
    model: 'gpt-3.5-turbo',
    messages: [
        { role: 'system', content: 'You are a helpful translation assistant.' },
        { role: 'user', content: prompt },
    ],
    max_tokens: 1000,
    temperature: 0.2,
    };
    const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
    });
    if (!response.ok) {
    throw new Error('OpenAI API error');
    }
    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();
    return translation || '[Translation failed]';
},

  async translateBatch(messages: string[], targetLang: string) {
    const prompt = `You are translating a conversation between people. Each item in the array is a separate message. Please translate each message naturally to ${targetLang}, preserving the conversational flow. Also, detect and return the main language used in the conversation. IMPORTANT: Preserve the text formatting of each message if possible.\n\nMessages:\n${JSON.stringify(messages)}\n\nReturn a JSON object with keys 'translations' (an array of translated messages) and 'mainLanguage' (the detected language).`;
    const body = {
    model: 'gpt-3.5-turbo',
    messages: [
        { role: 'system', content: 'You are a helpful translation assistant.' },
        { role: 'user', content: prompt },
    ],
    max_tokens: 2000,
    temperature: 0.2,
    };
    const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
    });
    if (!response.ok) {
    throw new Error('OpenAI API error');
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    try {
    const json = JSON.parse(content!);
    return {
        translations: Array.isArray(json.translations) ? json.translations : [],
        mainLanguage: typeof json.mainLanguage === 'string' ? json.mainLanguage : '',
    };
    } catch {
    // fallback: return all as failed
    return { translations: messages.map(() => '[Translation failed]'), mainLanguage: '' };
    }
},

  async detectLanguage(messages: string[]) {
    const prompt = `Identify the main language used in the following chat messages. Only return the language code (e.g., 'en', 'es', 'uk'). Messages: ${JSON.stringify(messages)}`;
    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful language detection assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 10,
      temperature: 0.0,
    };
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('OpenAI API error');
    }
    const data = await response.json();
    const lang = data.choices?.[0]?.message?.content?.trim();
    return lang || 'en';
  },

  async translateWithContext(target: string, context: string[], targetLang: string) {
    const before = context.slice(0, 4).join('\n');
    const after = context.slice(4).join('\n');
    const prompt = `You are translating a chat message with context.\nHere are the previous messages:\n${before}\nHere is the message to translate:\n${target}\nHere are the following messages:\n${after}\nTranslate ONLY the message above to ${targetLang}. Return only the translation, without any extra quotes, code blocks, or formatting wrappers. IMPORTANT: Preserve the text formatting of the message if possible.`;
    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful translation assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.2,
    };
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('OpenAI API error');
    }
    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();
    return translation || '[Translation failed]';
  },
}; 