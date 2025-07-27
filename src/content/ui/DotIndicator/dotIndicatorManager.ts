import { createDotIndicator, type DotIndicatorOptions } from './dotIndicator';

export interface DotIndicatorManagerOptions extends DotIndicatorOptions {
  getInput: () => HTMLElement | null;
}

// Store cleanup functions for each dotIndicator instance
const cleanupMap = new WeakMap<any, () => void>();

export function createDotIndicatorManager(options: DotIndicatorManagerOptions) {
  const { getInput, ...dotOptions } = options;
  let dotIndicator: ReturnType<typeof createDotIndicator> | null = null;

  function createDotIndicatorForInput() {
    const input = getInput();
    if (!input) return;

    // Clean up existing dot indicator
    if (dotIndicator) {
      dotIndicator.destroy();
      // Clean up listeners/observers if present
      const cleanup = cleanupMap.get(dotIndicator);
      if (cleanup) cleanup();
      cleanupMap.delete(dotIndicator);
      dotIndicator = null;
    }

    // Create new dot indicator
    dotIndicator = createDotIndicator({
      ...dotOptions,
      onToggle: (enabled) => {
        dotOptions.onToggle?.(enabled);
        // Store state in chrome storage
        chrome.storage.local.set({ interceptorsEnabled: enabled });
      },
      onLanguageChange: (language) => {
        dotOptions.onLanguageChange?.(language);
        // Store language in chrome storage
        chrome.storage.local.set({ primaryLanguage: language });
      }
    });

    // Position dot indicator relative to input
    positionDotIndicatorRelativeToInput(input);
    
    // Append dot indicator to body
    document.body.appendChild(dotIndicator.element);

    // --- Add listeners for repositioning ---
    // Window resize
    const handleReposition = () => {
      positionDotIndicatorRelativeToInput(input);
    };
    window.addEventListener('resize', handleReposition, false);
    // Input resize
    let resizeObserver: ResizeObserver | null = null;
    resizeObserver = new ResizeObserver(handleReposition);
    resizeObserver.observe(input);

    // Store cleanup for destroy
    cleanupMap.set(dotIndicator, () => {
      window.removeEventListener('resize', handleReposition, false);
      if (resizeObserver) resizeObserver.disconnect();
    });
  }

  function positionDotIndicatorRelativeToInput(input: HTMLElement) {
    if (!dotIndicator) return;

    const inputRect = input.getBoundingClientRect();
    const dotElement = dotIndicator.element;

    let top: number;
    let left: number;
    if (inputRect.height < 30) {
      // Center vertically
      top = inputRect.top + window.scrollY + (inputRect.height / 2) - (dotElement.offsetHeight / 2);
      left = inputRect.right + window.scrollX - dotElement.offsetWidth - 16;
    } else {
      // Stick to top-right, considering input paddings
      const style = window.getComputedStyle(input);
      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;

      top = inputRect.top + window.scrollY + paddingTop;
      left = inputRect.right + window.scrollX - dotElement.offsetWidth - paddingRight;
    }

    dotElement.style.position = 'absolute';
    dotElement.style.top = `${top}px`;
    dotElement.style.left = `${left}px`;
  }

  function destroy() {
    if (dotIndicator) {
      dotIndicator.destroy();
      // Clean up listeners/observers if present
      const cleanup = cleanupMap.get(dotIndicator);
      if (cleanup) cleanup();
      cleanupMap.delete(dotIndicator);
      dotIndicator = null;
    }
  }

  return {
    create: createDotIndicatorForInput,
    destroy,
    isEnabled: () => dotIndicator?.isEnabled() ?? false,
    setEnabled: (enabled: boolean) => dotIndicator?.setEnabled(enabled)
  };
} 