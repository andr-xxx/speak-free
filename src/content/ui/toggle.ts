export interface ToggleOptions {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function createToggle(options: ToggleOptions = {}) {
  const { enabled = false, onToggle } = options;
  
  // Create toggle container
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'speakfree-toggle-container';
  if (enabled) {
    toggleContainer.classList.add('enabled');
  }

  // Create toggle switch
  const toggleSwitch = document.createElement('div');
  toggleSwitch.className = 'speakfree-toggle-switch';
  if (enabled) {
    toggleSwitch.classList.add('enabled');
  }

  // Create toggle thumb
  const toggleThumb = document.createElement('div');
  toggleThumb.className = 'speakfree-toggle-thumb';

  // Assemble toggle
  toggleSwitch.appendChild(toggleThumb);
  toggleContainer.appendChild(toggleSwitch);

  // Add click handler
  let isEnabled = enabled;
  
  function updateToggle() {
    if (isEnabled) {
      toggleContainer.classList.add('enabled');
      toggleSwitch.classList.add('enabled');
    } else {
      toggleContainer.classList.remove('enabled');
      toggleSwitch.classList.remove('enabled');
    }
  }

  toggleContainer.addEventListener('click', () => {
    isEnabled = !isEnabled;
    updateToggle();
    onToggle?.(isEnabled);
  });

  // Public API
  return {
    element: toggleContainer,
    setEnabled(enabled: boolean) {
      isEnabled = enabled;
      updateToggle();
    },
    isEnabled() {
      return isEnabled;
    },
    destroy() {
      toggleContainer.remove();
    }
  };
} 