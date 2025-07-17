/// <reference path="./adapterConfig.ts" />
// WhatsApp Web site adapter for SpeakFree extension
// Loads selectors from a JSON config for easy updates.
import { AdapterConfig } from './adapterConfig';
import { BaseAdapter } from './baseAdapter';

class WhatsAppAdapter extends BaseAdapter<AdapterConfig> {
  extractMessageText(element: HTMLElement): string {
    return element.textContent?.trim() || '';
  }
}

export function getWhatsAppAdapter(): Promise<WhatsAppAdapter> {
  return import('../configs/whatsappAdapterConfig.json').then(m => {
    const config: AdapterConfig = m.default || m;
    return new WhatsAppAdapter(config);
  });
} 