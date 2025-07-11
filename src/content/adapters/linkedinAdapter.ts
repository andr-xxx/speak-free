/// <reference path="./adapterConfig.ts" />
// LinkedIn Messaging site adapter for SpeakFree extension
// Loads selectors from a JSON config for easy updates.
import { AdapterConfig } from './adapterConfig';
import { BaseAdapter } from './baseAdapter';

class LinkedInAdapter extends BaseAdapter<AdapterConfig> {
  extractMessageText(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;
    const html = clone.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.trim() || '';
  }

  getInputText(input: HTMLElement): string {
    return input ? input.textContent || '' : '';
  }
}

export function getLinkedInAdapter(): Promise<LinkedInAdapter> {
  return import('../configs/linkedinAdapterConfig.json').then(m => {
    const config: AdapterConfig = m.default || m;
    return new LinkedInAdapter(config);
  });
} 