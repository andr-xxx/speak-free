import { createToggle, type ToggleOptions } from './toggle';

export interface ToggleManagerOptions extends ToggleOptions {
  getInput: () => HTMLElement | null;
}

export function createToggleManager(options: ToggleManagerOptions) {
  const { getInput, ...toggleOptions } = options;
  let toggle: ReturnType<typeof createToggle> | null = null;

  function createToggleForInput() {
    const input = getInput();
    if (!input) return;

    // Clean up existing toggle
    if (toggle) {
      toggle.destroy();
      toggle = null;
    }

    // Create new toggle
    toggle = createToggle({
      ...toggleOptions,
      onToggle: (enabled) => {
        toggleOptions.onToggle?.(enabled);
        // Store state in chrome storage
        chrome.storage.local.set({ interceptorsEnabled: enabled });
      }
    });

    // Load saved state
    chrome.storage.local.get('interceptorsEnabled', (result) => {
      const savedState = result.interceptorsEnabled ?? false;
      toggle?.setEnabled(savedState);
    });

    // Position toggle relative to input
    positionToggleRelativeToInput(input);
    
    // Append toggle to body
    document.body.appendChild(toggle.element);
  }

  function positionToggleRelativeToInput(input: HTMLElement) {
    if (!toggle) return;

    const inputRect = input.getBoundingClientRect();
    const toggleElement = toggle.element;
    
    // Position toggle in bottom-right corner of input
    toggleElement.style.position = 'fixed';
    toggleElement.style.bottom = `${window.innerHeight - inputRect.bottom + 8}px`;
    toggleElement.style.right = `${window.innerWidth - inputRect.right + 8}px`;
  }

  function destroy() {
    if (toggle) {
      toggle.destroy();
      toggle = null;
    }
  }

  return {
    create: createToggleForInput,
    destroy,
    isEnabled: () => toggle?.isEnabled() ?? false,
    setEnabled: (enabled: boolean) => toggle?.setEnabled(enabled)
  };
} 