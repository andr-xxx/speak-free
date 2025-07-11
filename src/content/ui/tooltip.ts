import { formatMessageHTML } from '../utils/utils';

export let tooltip: HTMLDivElement | null = null;

export function showTooltip(target: HTMLElement, text: string) {
  hideTooltip();
  tooltip = document.createElement('div');
  tooltip.className = 'speakfree-tooltip';
  tooltip.innerHTML = formatMessageHTML(text);
  document.body.appendChild(tooltip);

  // Smart positioning: by default above, below only if not enough space
  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const margin = 8;
  let top = rect.top - tooltipRect.height - margin + scrollY;
  let left = rect.left + scrollX;
  let position = 'above';

  // If not enough space above, show below
  if (top < scrollY) {
    top = rect.bottom + margin + scrollY;
    position = 'below';
  }
  // Clamp left to viewport
  if (left + tooltipRect.width > window.innerWidth + scrollX) {
    left = window.innerWidth - tooltipRect.width - margin + scrollX;
  }
  if (left < scrollX) {
    left = scrollX + margin;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;

  // Set arrow position class
  tooltip.classList.toggle('speakfree-tooltip-above', position === 'above');
  tooltip.classList.toggle('speakfree-tooltip-below', position === 'below');
}

export function hideTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
} 