import { openAIProvider } from './openAIProvider';
import { geminiProvider } from './geminiProvider';

export interface TranslationProvider {
  translate(text: string, targetLang: string): Promise<string>;
  translateBatch(messages: string[], targetLang: string): Promise<{ translations: string[], mainLanguage: string }>;
  detectLanguage(messages: string[]): Promise<string>;
  translateWithContext(target: string, context: string[], targetLang: string): Promise<string>;
}

export class TranslationService {
  private static currentProvider: TranslationProvider = geminiProvider;

  static setProvider(provider: TranslationProvider) {
    TranslationService.currentProvider = provider;
  }

  static translate(text: string, targetLang: string): Promise<string> {
    return TranslationService.currentProvider.translate(text, targetLang);
  }

  static translateBatch(messages: string[], targetLang: string): Promise<{ translations: string[], mainLanguage: string }> {
    return TranslationService.currentProvider.translateBatch(messages, targetLang);
  }

  static detectLanguage(messages: string[]): Promise<string> {
    return TranslationService.currentProvider.detectLanguage(messages);
  }

  static translateWithContext(target: string, context: string[], targetLang: string): Promise<string> {
    return TranslationService.currentProvider.translateWithContext(target, context, targetLang);
  }

  static availableProviders = {
    openai: openAIProvider,
    gemini: geminiProvider,
  };
} 