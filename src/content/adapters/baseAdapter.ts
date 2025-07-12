import type { Adapter, AdapterConfig } from './adapterConfig';

export abstract class BaseAdapter<T extends AdapterConfig = AdapterConfig> {
  readonly messageSelector: string;
  readonly inputSelector: string;
  readonly sendButtonSelector: string;
  readonly messageContainerSelector: string;
  readonly chatContainerSelector?: string | string[];

  constructor(config: T) {
    this.messageSelector = config.messageSelector;
    this.inputSelector = config.inputSelector;
    this.sendButtonSelector = config.sendButtonSelector;
    this.messageContainerSelector = config.messageContainerSelector;
    this.chatContainerSelector = config.chatContainerSelector;
  }

  getMessages(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(this.messageSelector));
  }

  getInput(): HTMLElement | null {
    return document.querySelector<HTMLElement>(this.inputSelector);
  }

  getSendButton(): HTMLElement | null {
    return document.querySelector<HTMLElement>(this.sendButtonSelector);
  }

  observeMessages(callback: (message: HTMLElement) => void): MutationObserver {
    const container = document.querySelector(this.messageContainerSelector);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement && (node.matches(this.messageSelector) || node.querySelector(this.messageSelector))) {
            callback(node);
          }
        }
      }
    });
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }
    return observer;
  }

  sendMessage(): void {
    const button = document.querySelector<HTMLElement>(this.sendButtonSelector);
    if (button) (button as HTMLButtonElement).click();
  }

  getChatContainer(): HTMLElement | null {
    const selectors = this.chatContainerSelector;
    if (!selectors) return null;
    if (Array.isArray(selectors)) {
      for (const sel of selectors) {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el) return el;
      }
      return null;
    } else {
      return document.querySelector(selectors) as HTMLElement | null;
    }
  }

  getMessageId(element: HTMLElement): string {
    return element.getAttribute('data-id') || element.getAttribute('data-message-id') || String(this.getMessages().indexOf(element));
  }

  getContextMessages(element: HTMLElement, count: number): HTMLElement[] {
    const messages = this.getMessages();
    const idx = messages.indexOf(element);
    if (idx === -1) return [];
    const start = Math.max(0, idx - count);
    const end = Math.min(messages.length, idx + count + 1);
    return messages.slice(start, end).filter(msg => msg !== element);
  }

  attachOutgoingMessageInterceptor({ TranslationService, showConfirmPopup }: any) {
    interface InterceptableElement extends HTMLElement {
      _speakfree_intercept?: boolean;
    }
    let lastInput: InterceptableElement | null = null;
    let lastSendButton: InterceptableElement | null = null;
    let skipNextInterception = false;
    let interceptorsEnabled = false;

    const handleOutgoing = async (input: InterceptableElement) => {
      const original = this.getInputText(input).trim();
      if (!original) return;
      const result = await chrome.storage.local.get('detectedLanguage');
      const targetLang = result.detectedLanguage || 'en';
      const translated = await TranslationService.translate(original, targetLang);
      const edited = await showConfirmPopup(translated, input);
      if (typeof edited === 'string') {
        skipNextInterception = true;
        await this.setInputText(edited);
        setTimeout(() => {
          const sendButton = this.getSendButton();
          if (sendButton) (sendButton as HTMLButtonElement).click();
        }, 100);
      }
    };

    // Load initial state
    chrome.storage.local.get('interceptorsEnabled', (result) => {
      interceptorsEnabled = result.interceptorsEnabled ?? false;
    });

    // Listen for state changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.interceptorsEnabled) {
        interceptorsEnabled = changes.interceptorsEnabled.newValue ?? false;
      }
    });

    setInterval(() => {
      const input = this.getInput() as InterceptableElement | null;
      const sendButton = this.getSendButton() as InterceptableElement | null;
      if (!input || !sendButton) return;
      if (input === lastInput && sendButton === lastSendButton) return;
      lastInput = input;
      lastSendButton = sendButton;
      if (input && !input._speakfree_intercept) {
        input.addEventListener('keydown', async (e: KeyboardEvent) => {
          if (!interceptorsEnabled) return;

          if (skipNextInterception) {
            skipNextInterception = false;
            return;
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            await handleOutgoing(input);
          }
        }, true);
        input._speakfree_intercept = true;
      }
      if (sendButton && !sendButton._speakfree_intercept) {
        sendButton.addEventListener('click', async (e) => {
          if (!interceptorsEnabled) return;
          
          if (skipNextInterception) {
            skipNextInterception = false;
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          await handleOutgoing(input);
        }, true);
        sendButton._speakfree_intercept = true;
      }
    }, 1000);
  }

  async setInputText(text: string): Promise<void> {
    const input = this.getInput();
    if (!input) return;
    input.focus();
    await (typeof window !== 'undefined' && 'requestAnimationFrame' in window ? new Promise(r => requestAnimationFrame(r)) : Promise.resolve());
    document.execCommand('selectAll', true);
    await (typeof window !== 'undefined' && 'requestAnimationFrame' in window ? new Promise(r => requestAnimationFrame(r)) : Promise.resolve());
    document.execCommand('insertText', true, text);
    input.blur();
  }

  abstract extractMessageText(element: HTMLElement): string;
  abstract getInputText(input: HTMLElement): string;
} 