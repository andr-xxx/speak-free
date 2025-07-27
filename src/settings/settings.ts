/// <reference types="chrome" />
import { SUPPORTED_LANGUAGES } from '../languages';

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('primary-language') as HTMLSelectElement;
  const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
  const status = document.getElementById('status') as HTMLDivElement;

  // Populate language dropdown
  select.innerHTML = '';
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    select.appendChild(option);
  });

  // Load saved language
  chrome.storage.local.get(['primaryLanguage'], (result: { primaryLanguage?: string }) => {
    if (result.primaryLanguage) {
      select.value = result.primaryLanguage;
    }
  });

  saveBtn.addEventListener('click', () => {
    const lang = select.value;
    chrome.storage.local.set({ primaryLanguage: lang }, () => {
      status.textContent = 'Saved!';
      setTimeout(() => (status.textContent = ''), 1000);
    });
  });
}); 