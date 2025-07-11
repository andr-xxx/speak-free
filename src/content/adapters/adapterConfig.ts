export interface AdapterConfig {
  messageSelector: string;
  inputSelector: string;
  sendButtonSelector: string;
  messageContainerSelector: string;
  chatContainerSelector?: string | string[];
}

export type Adapter<T extends AdapterConfig = AdapterConfig> = T & {
  getMessages(): HTMLElement[];
  getInput(): HTMLElement | null;
  getSendButton(): HTMLElement | null;
  observeMessages(callback: (message: HTMLElement) => void): MutationObserver;
  setInputText(text: string): Promise<void>;
  sendMessage(): void;
  attachOutgoingMessageInterceptor(services: {
    TranslationService: typeof import('../translation/translationService').TranslationService,
    showConfirmPopup: typeof import('../ui/confirmPopup').showConfirmPopup
  }): void;
  getChatContainer(): HTMLElement | null;
  extractMessageText(element: HTMLElement): string;
  getMessageId(element: HTMLElement): string;
  getContextMessages(element: HTMLElement, count: number): HTMLElement[];
}; 