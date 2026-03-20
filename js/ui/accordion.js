/* ========================================
   ACCORDION - Collapsible Sections
   ======================================== */


/**
 * Initialize all accordions
 */
function initAccordions() {
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

  console.log('📂 Accordions initialized');
}

/**
 * Open specific accordion by ID
 */
function openAccordion(id) {
  const accordion = document.getElementById(id);
  if (accordion && accordion.tagName === 'DETAILS') {
    accordion.open = true;
  }
}

/**
 * Close specific accordion by ID
 */
function closeAccordion(id) {
  const accordion = document.getElementById(id);
  if (accordion && accordion.tagName === 'DETAILS') {
    accordion.open = false;
  }
}

/**
 * Toggle specific accordion by ID
 */
function toggleAccordion(id) {
  const accordion = document.getElementById(id);
  if (accordion && accordion.tagName === 'DETAILS') {
    accordion.open = !accordion.open;
  }
}

/**
 * Close all accordions in a container
 */
function closeAllAccordions(container = document) {
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
function openOnlyAccordion(id, container = document) {
  const accordions = container.querySelectorAll('.accordion');
  accordions.forEach(acc => {
    if (acc.tagName === 'DETAILS') {
      acc.open = acc.id === id;
    }
  });
}
