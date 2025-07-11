import type { Adapter } from './adapters/adapterConfig';
import { hashContext } from './utils/utils';

export function createMessageManager(adapter: Adapter, TranslationService: any) {
  // Cache: key = messageId + contextHash, value = translation
  const translationCache = new Map<string, string>();
  let mainLanguage: string | null = null;

  function getCacheKey(msg: HTMLElement, context: string[]): string {
    const id = adapter.getMessageId(msg);
    const ctxHash = hashContext(context);
    return `${id}::${ctxHash}`;
  }

  function clear() {
    translationCache.clear();
    mainLanguage = null;
  }

  function setMainLanguage(lang: string | null) {
    mainLanguage = lang;
  }

  // On hover, translate with context if not cached
  function attachHoverListeners(showTooltip: any, hideTooltip: any) {
    const messages = adapter.getMessages();
    for (const msg of messages) {
      if ((msg as any)._speakfree_hover) continue;
      (msg as any)._speakfree_hover = true;
      let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
      msg.addEventListener('mouseenter', async (e) => {
        hoverTimeout = setTimeout(async () => {
          const contextEls = adapter.getContextMessages(msg, 4);
          const context = contextEls.map(m => adapter.extractMessageText(m));
          const cacheKey = getCacheKey(msg, context);
          let translation = translationCache.get(cacheKey);
          if (!translation) {
            showTooltip(msg, 'Translating...');
            const target = adapter.extractMessageText(msg);
            // Get target language from storage
            const result = await chrome.storage.local.get('primaryLanguage');
            const targetLang = result.primaryLanguage || 'en';
            console.log(targetLang);
            translation = await TranslationService.translateWithContext(target, context, targetLang);
            translationCache.set(cacheKey, translation ?? '');
          }
          showTooltip(msg, translation);
        }, 300);
      });
      msg.addEventListener('mouseleave', () => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
        hideTooltip();
      });
    }
  }

  return {
    attachHoverListeners,
    clear,
    setMainLanguage,
    translationCache
  };
} 