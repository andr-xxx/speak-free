import type { Adapter } from './adapters/adapterConfig';

export function watchChatContainer(
  adapter: Adapter,
  onSwitch: (container: HTMLElement) => void
) {
  let lastChatContainer: HTMLElement | null = null;
  let chatSwitchObserver: MutationObserver | null = null;

  async function handleChatSwitch(newContainer: HTMLElement) {
    lastChatContainer = newContainer;
    onSwitch(newContainer);
  }

  async function pollForChatContainer() {
    while (true) {
      let container = adapter.getChatContainer();
      if (!container) {
        await new Promise(res => setTimeout(res, 750));
        continue;
      }
      if (container !== lastChatContainer) {
        await handleChatSwitch(container);
      }
      if (chatSwitchObserver) chatSwitchObserver.disconnect();
      chatSwitchObserver = new MutationObserver(async () => {
        const newContainer = adapter.getChatContainer();
        if (newContainer && newContainer !== lastChatContainer) {
          await handleChatSwitch(newContainer);
        }
      });
      chatSwitchObserver.observe(container.parentElement || container, { childList: true, subtree: true });
      while (adapter.getChatContainer() === container) {
        await new Promise(res => setTimeout(res, 2000));
      }
      if (chatSwitchObserver) chatSwitchObserver.disconnect();
      lastChatContainer = null;
    }
  }
  pollForChatContainer();
} 