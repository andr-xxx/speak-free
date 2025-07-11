/// <reference path="./adapterConfig.ts" />
// WhatsApp Web site adapter for SpeakFree extension
// Loads selectors from a JSON config for easy updates.
import { AdapterConfig } from './adapterConfig';
import { BaseAdapter } from './baseAdapter';

class WhatsAppAdapter extends BaseAdapter<AdapterConfig> {
  extractMessageText(element: HTMLElement): string {
    return element.textContent?.trim() || '';
  }

  getInputText(input: HTMLElement): string {
    let text = '';
    input?.childNodes.forEach((node) => {
      if (node.nodeName === 'P') {
        text += (node as HTMLElement).innerText + '\n';
      } else if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent + '\n';
      }
    });
    return text;
  }
}

export function getWhatsAppAdapter(): Promise<WhatsAppAdapter> {
  return import('../configs/whatsappAdapterConfig.json').then(m => {
    const config: AdapterConfig = m.default || m;
    return new WhatsAppAdapter(config);
  });
} 