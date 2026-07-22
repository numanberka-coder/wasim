/* ========================================
   HISTORY - Geri Al ağı (undo)
   Yıkıcı işlemlerden önce tam durum anlık görüntüsü alır ve
   aksiyon butonlu bir toast ile geri yüklemeyi sunar.
   state.export()/import() üzerine kuruludur.
   ======================================== */

import { state } from '../state.js';
import { deepClone } from '../utils.js';
import { showToast } from '../ui/toast.js';

/**
 * Uygulama katmanı, geri yükleme sonrası yeniden çizim/kayıt için
 * bir callback kaydeder (state.import zaten çağrılmış olur).
 * @type {null | (() => void)}
 */
let afterRestore = null;

/**
 * Geri yükleme sonrası çalışacak render/save kancasını kaydet.
 * @param {() => void} fn
 */
export function setRestoreHook(fn) {
  afterRestore = fn;
}

/**
 * Mevcut durumun bağımsız (deep-clone) bir anlık görüntüsünü al.
 * export() referans paylaştığı için klonlamak şart.
 * @returns {Object}
 */
export function captureSnapshot() {
  return deepClone(state.export());
}

/**
 * Bir anlık görüntüyü geri yükle ve render/save kancasını tetikle.
 * @param {Object} snapshot
 */
export function restoreSnapshot(snapshot) {
  if (!snapshot) return;
  state.import(deepClone(snapshot));
  if (afterRestore) afterRestore();
}

/**
 * Yıkıcı bir işlemi geri alınabilir yap: işlemden ÖNCE snapshot al,
 * işlemi çalıştır, sonra "Geri Al" butonlu toast göster.
 * @param {Object} opts
 * @param {() => void} opts.action  yıkıcı işlem
 * @param {string} opts.message  toast metni (ör. "Kişi silindi")
 * @param {number} [opts.duration]
 */
export function runUndoable({ action, message, duration }) {
  const snapshot = captureSnapshot();
  action();
  showToast(message, { duration, actionLabel: 'Geri Al', onAction: () => restoreSnapshot(snapshot) });
}
