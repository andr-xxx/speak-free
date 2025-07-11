import type { TranslationProvider } from './translationService';

declare const GEMINI_API_KEY: string;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Helper function to extract JSON from markdown code blocks or return as-is
function extractJsonFromResponse(content: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  // If no code blocks, return the content as-is
  return content.trim();
}

export const geminiProvider: TranslationProvider = {
  async translate(text: string, targetLang: string) {
    const prompt = `Translate the following text to ${targetLang} (only return the translation, no explanation):\n"""${text}"""`;
    const body = {
      contents: [
        { parts: [{ text: prompt }] }
      ]
    };
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Gemini API error');
    }
    const data = await response.json();
    // Gemini returns candidates[0].content.parts[0].text
    const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return translation || '[Translation failed]';
  },

  async translateBatch(messages: string[], targetLang: string) {
    const prompt = `You are translating a conversation between people. Each item in the array is a separate message. Please translate each message naturally to ${targetLang}, preserving the conversational flow. Also, detect and return the main language used in the conversation.\n\nMessages:\n${JSON.stringify(messages)}\n\nReturn a JSON object with keys 'translations' (an array of translated messages) and 'mainLanguage' (the detected language).`;
    const body = {
      contents: [
        { parts: [{ text: prompt }] }
      ]
    };
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Gemini API error');
    }
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    try {
      const cleanJson = extractJsonFromResponse(content!);
      const json = JSON.parse(cleanJson);
      return {
        translations: Array.isArray(json.translations) ? json.translations : [],
        mainLanguage: typeof json.mainLanguage === 'string' ? json.mainLanguage : '',
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw content:', content);
      return { translations: messages.map(() => '[Translation failed]'), mainLanguage: '' };
    }
  },

  async detectLanguage(messages: string[]) {
    const prompt = `Identify the main language used in the following chat messages. Only return the language code (e.g., 'en', 'es', 'uk'). Messages: ${JSON.stringify(messages)}`;
    const body = {
      contents: [
        { parts: [{ text: prompt }] }
      ]
    };
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Gemini API error');
    }
    const data = await response.json();
    const lang = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return lang || 'en';
  },

  async translateWithContext(target: string, context: string[], targetLang: string) {
    const before = context.slice(0, 4).join('\n');
    const after = context.slice(4).join('\n');
    const prompt = `You are translating a chat message with context.\nHere are the previous messages:\n${before}\nHere is the message to translate:\n"${target}"\nHere are the following messages:\n${after}\nTranslate ONLY the message in quotes to ${targetLang}. Return only the translation.`;
    const body = {
      contents: [
        { parts: [{ text: prompt }] }
      ]
    };
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Gemini API error');
    }
    const data = await response.json();
    const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return translation || '[Translation failed]';
  },
}; 