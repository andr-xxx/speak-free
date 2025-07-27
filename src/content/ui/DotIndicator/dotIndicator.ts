import { SUPPORTED_LANGUAGES } from '../../../languages';

export interface DotIndicatorOptions {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  onLanguageChange?: (language: string) => void;
}

export function createDotIndicator(options: DotIndicatorOptions = {}) {
  const { enabled = false, onToggle, onLanguageChange } = options;
  
  // Create dot container
  const dotContainer = document.createElement('div');
  dotContainer.className = 'speakfree-dot-container';

  // Create dot
  const dot = document.createElement('div');
  dot.className = 'speakfree-dot';
  if (enabled) {
    dot.classList.add('enabled');
  }

  // Create popup
  const popup = document.createElement('div');
  popup.className = 'speakfree-dot-popup';
  popup.style.display = 'none';

  // Create close icon
  const closeIcon = document.createElement('span');
  closeIcon.className = 'speakfree-dot-popup-close';
  closeIcon.innerHTML = '&times;';
  closeIcon.title = 'Close';
  popup.appendChild(closeIcon);

  // Create popup content
  const popupContent = document.createElement('div');
  popupContent.className = 'speakfree-dot-popup-content';

  // Language dropdown
  const languageSection = document.createElement('div');
  languageSection.className = 'speakfree-popup-section';
  
  const languageLabel = document.createElement('label');
  languageLabel.textContent = 'Target Language:';
  languageLabel.className = 'speakfree-popup-label';
  
  const languageSelect = document.createElement('select');
  languageSelect.className = 'speakfree-popup-select';
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelect.appendChild(option);
  });

  // Load saved language
  chrome.storage.local.get('detectedLanguage', (result) => {    
    if (result.detectedLanguage) {
      languageSelect.value = result.detectedLanguage;
    }
  });

  // Listen for changes to detectedLanguage in storage and update dropdown
  chrome.storage.onChanged.addListener((changes, area) => {    
    if (area === 'local' && changes.detectedLanguage) {
      languageSelect.value = changes.detectedLanguage.newValue;
    }
  });

  languageSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    const language = target.value;
    chrome.storage.local.set({ detectedLanguage: language });
    onLanguageChange?.(language);
  });

  languageSection.appendChild(languageLabel);
  languageSection.appendChild(languageSelect);

  // Toggle section
  const toggleSection = document.createElement('div');
  toggleSection.className = 'speakfree-popup-section';
  
  const toggleLabel = document.createElement('label');
  toggleLabel.textContent = 'Enable Translation:';
  toggleLabel.className = 'speakfree-popup-label';
  
  const toggleSwitch = document.createElement('div');
  toggleSwitch.className = 'speakfree-popup-toggle';
  if (enabled) {
    toggleSwitch.classList.add('enabled');
  }
  
  const toggleThumb = document.createElement('div');
  toggleThumb.className = 'speakfree-popup-toggle-thumb';
  
  toggleSwitch.appendChild(toggleThumb);
  
  let isEnabled = enabled;
  
  function updateToggle() {
    if (isEnabled) {
      toggleSwitch.classList.add('enabled');
      dot.classList.add('enabled');
    } else {
      toggleSwitch.classList.remove('enabled');
      dot.classList.remove('enabled');
    }
  }

  toggleSwitch.addEventListener('click', () => {
    isEnabled = !isEnabled;
    updateToggle();
    onToggle?.(isEnabled);
    chrome.storage.local.set({ interceptorsEnabled: isEnabled });
  });

  // Load saved state
  chrome.storage.local.get('interceptorsEnabled', (result) => {
    const savedState = result.interceptorsEnabled ?? false;
    isEnabled = savedState;
    updateToggle();
  });

  toggleSection.appendChild(toggleLabel);
  toggleSection.appendChild(toggleSwitch);

  // Assemble popup
  popupContent.appendChild(languageSection);
  popupContent.appendChild(toggleSection);
  popup.appendChild(popupContent);

  // Assemble dot indicator
  dotContainer.appendChild(dot);
  dotContainer.appendChild(popup);

  // Popup open/close logic
  function openPopup() {
    popup.style.display = 'block';
    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 0);
  }
  function closePopup() {
    popup.style.display = 'none';
    document.removeEventListener('mousedown', handleOutsideClick);
  }
  function handleOutsideClick(e: MouseEvent) {
    if (!popup.contains(e.target as Node) && !dot.contains(e.target as Node)) {
      closePopup();
    }
  }
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popup.style.display === 'block') {
      closePopup();
    } else {
      openPopup();
    }
  });

  closeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    closePopup();
  });

  // Public API
  return {
    element: dotContainer,
    setEnabled(enabled: boolean) {
      isEnabled = enabled;
      updateToggle();
    },
    isEnabled() {
      return isEnabled;
    },
    destroy() {
      document.removeEventListener('mousedown', handleOutsideClick);
      dotContainer.remove();
    }
  };
} 