// Injects required styles for SpeakFree content scripts
export function injectContentStyles() {
  function injectContentStyle(href: string, id?: string) {
    if (id && document.getElementById(id)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL(href);
    if (id) link.id = id;
    document.head.appendChild(link);
  }
  injectContentStyle('content/ui/Tooltip/tooltip.css', 'speakfree-tooltip-style');
  injectContentStyle('content/ui/ConfirmPopup/confirmPopup.css', 'speakfree-confirm-popup-style');
  injectContentStyle('content/ui/Toggle/toggle.css', 'speakfree-toggle-style');
} 