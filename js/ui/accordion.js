/* ========================================
   ACCORDION - Collapsible Sections
   ======================================== */

import { $$, Logger } from '../utils.js';

/**
 * Initialize all accordions
 */
export function initAccordions() {
  const accordions = $$('.accordion');

  accordions.forEach(accordion => {
    const header = accordion.querySelector('.accordion-header');
    
    if (header) {
      // Update icon on toggle
      accordion.addEventListener('toggle', () => {
        const icon = header.querySelector('.accordion-icon');
        if (icon) {
          icon.textContent = accordion.open ? '▼' : '▶';
        }
      });
    }
  });

  Logger.info('📂 Accordions initialized');
}

/**
 * Open specific accordion by ID
 */
export function openAccordion(id) {
  const accordion = document.getElementById(id);
  if (accordion && accordion.tagName === 'DETAILS') {
    accordion.open = true;
  }
}

/**
 * Close specific accordion by ID
 */
export function closeAccordion(id) {
  const accordion = document.getElementById(id);
  if (accordion && accordion.tagName === 'DETAILS') {
    accordion.open = false;
  }
}

/**
 * Toggle specific accordion by ID
 */
export function toggleAccordion(id) {
  const accordion = document.getElementById(id);
  if (accordion && accordion.tagName === 'DETAILS') {
    accordion.open = !accordion.open;
  }
}

/**
 * Close all accordions in a container
 */
export function closeAllAccordions(container = document) {
  const accordions = container.querySelectorAll('.accordion');
  accordions.forEach(acc => {
    if (acc.tagName === 'DETAILS') {
      acc.open = false;
    }
  });
}

/**
 * Open only one accordion, close others
 */
export function openOnlyAccordion(id, container = document) {
  const accordions = container.querySelectorAll('.accordion');
  accordions.forEach(acc => {
    if (acc.tagName === 'DETAILS') {
      acc.open = acc.id === id;
    }
  });
}
