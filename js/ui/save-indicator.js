/* ========================================
   SAVE INDICATOR - "Kaydedildi ✓" göstergesi
   storage.save başarıyla tamamlanınca kısa süreli,
   göze batmayan bir pill gösterir.
   ======================================== */

let pill = null;
let hideTimer = null;

function ensurePill() {
  if (pill) return pill;
  pill = document.createElement('div');
  pill.className = 'save-indicator';
  pill.setAttribute('role', 'status');
  pill.setAttribute('aria-live', 'polite');
  pill.textContent = 'Kaydedildi ✓';
  document.body.appendChild(pill);
  return pill;
}

function flash() {
  const el = ensurePill();
  el.classList.add('is-visible');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => el.classList.remove('is-visible'), 1800);
}

export function initSaveIndicator() {
  window.addEventListener('wa:saved', flash);
}
