import { getWhatsAppAdapter } from './adapters/whatsappAdapter';
import { getLinkedInAdapter } from './adapters/linkedinAdapter';
import { showTooltip, hideTooltip } from './ui/tooltip';
import { TranslationService } from './translation/translationService';
import { showConfirmPopup } from './ui/confirmPopup';
import { injectContentStyles } from './utils/uiInjector';
import { watchChatContainer } from './chatContainerWatcher';
import { createMessageManager } from './messageManager';
import { delay } from './utils/utils';

import type { Adapter } from './adapters/adapterConfig';

(async () => {
  injectContentStyles();

  const hostname = window.location.hostname;
  let adapter: Adapter | null = null;
  if (hostname.includes('whatsapp')) {
    adapter = await getWhatsAppAdapter();
  } else if (hostname.includes('linkedin')) {
    adapter = await getLinkedInAdapter();
  } else {
    return;
  }
  if (!adapter) return;

  const messageManager = createMessageManager(adapter, TranslationService);
  let messageObserver: MutationObserver | null = null;
  let messageUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

  function setupMessageObserver() {
    if (messageObserver) {
      messageObserver.disconnect();
    }
    messageObserver = adapter!.observeMessages(async () => {
      console.log('new messages received');
      
      // Clear existing timeout to debounce multiple rapid calls
      if (messageUpdateTimeout) {
        clearTimeout(messageUpdateTimeout);
      }
      
      // Set a new timeout to process messages after a short delay
      messageUpdateTimeout = setTimeout(async () => {
        const messages = adapter!.getMessages();
        messageManager.attachHoverListeners(showTooltip, hideTooltip);
        messageUpdateTimeout = null;
      }, 100); // 100ms debounce delay
    });
  }
  
  // Watch for chat container switches
  watchChatContainer(adapter, async () => {
    console.log('new chat received');
    messageManager.clear();
    setupMessageObserver();

    delay(500);
    // Get up to 10 last messages for language detection
    const newMessages = adapter.getMessages();
    const lastMessages = newMessages.slice(-10);
    const lastTexts = lastMessages.map(msg => adapter.extractMessageText(msg));
    const detectedLang = await TranslationService.detectLanguage(lastTexts);
    await chrome.storage.local.set({ detectedLanguage: detectedLang });
    console.log('Detected chat language:', detectedLang);

    // Do NOT translate all messages on chat open anymore
    // Only set up hover listeners
    messageManager.attachHoverListeners(showTooltip, hideTooltip);
  });

  // Initial message observer setup
  setupMessageObserver();

  // Attach outgoing message interception
  adapter.attachOutgoingMessageInterceptor({
    TranslationService,
    showConfirmPopup
  });
})(); 