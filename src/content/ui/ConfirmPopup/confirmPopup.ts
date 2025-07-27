let popup: HTMLDivElement | null = null;

export function showConfirmPopup(translated: string, inputEl?: HTMLElement): Promise<string | false> {
  return new Promise((resolve) => {
    hideConfirmPopup();
    popup = document.createElement('div');
    popup.className = 'speakfree-confirm-popup';
    popup.innerHTML = `
      <div class="speakfree-confirm-popup-backdrop"></div>
      <div class="speakfree-confirm-popup-content">
        <h2>Send Translated Message?</h2>
        <div class="speakfree-confirm-section">
          <div class="speakfree-confirm-label">Translation:</div>
          <textarea class="speakfree-confirm-translation" rows="5" style="width:100%;resize:vertical;"></textarea>
        </div>
        <div class="speakfree-confirm-actions">
          <button class="speakfree-btn speakfree-btn-send" autofocus>Send</button>
          <button class="speakfree-btn speakfree-btn-cancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    // Position above input if possible
    if (inputEl) {
      const inputRect = inputEl.getBoundingClientRect();
      const content = popup.querySelector('.speakfree-confirm-popup-content') as HTMLDivElement;
      setTimeout(() => {
        const contentRect = content.getBoundingClientRect();
        let top = inputRect.top + window.scrollY - contentRect.height - 8;
        if (top < 0) top = inputRect.bottom + window.scrollY + 8;
        let left = inputRect.left + window.scrollX;
        if (left + contentRect.width > window.innerWidth + window.scrollX) {
          left = window.innerWidth + window.scrollX - contentRect.width - 8;
        }
        if (left < 0) left = 8;
        content.style.top = `${top}px`;
        content.style.left = `${left}px`;
        content.style.width = `${inputRect.width}px`;
      }, 0);
    }
    const sendBtn = popup.querySelector('.speakfree-btn-send') as HTMLButtonElement;
    const textarea = popup.querySelector('.speakfree-confirm-translation') as HTMLTextAreaElement;
    textarea.value = translated;
    sendBtn.onclick = () => {
      resolve(textarea.value);
      hideConfirmPopup();
    };
    sendBtn.focus();
    (popup.querySelector('.speakfree-btn-cancel') as HTMLButtonElement).onclick = () => {
      resolve(false);
      hideConfirmPopup();
    };
    popup.querySelector('.speakfree-confirm-popup-backdrop')!.addEventListener('click', () => {
      resolve(false);
      hideConfirmPopup();
    });
  });
}

export function hideConfirmPopup() {
  if (popup) {
    popup.remove();
    popup = null;
  }
} 