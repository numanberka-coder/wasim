/* ========================================
   CONFIG - Constants & Defaults
   ======================================== */

const CONFIG = {
  STORAGE_KEY: 'whatsapp_simulator_v2',
  SCENES_KEY: 'whatsapp_simulator_scenes',
  AUTO_SAVE_INTERVAL: 30000,
  TYPING_BASE_MS: 400,
  TYPING_CHAR_MS: 30,
  TYPING_RANDOM_MS: 300,
  MIN_DELAY: 80,
  DEFAULT_SPEED: 900,
  DEFAULT_JITTER: 250,
};

const COLOR_POOL = [
  '#7dd3fc', '#fda4af', '#fbbf24', '#a7f3d0',
  '#c4b5fd', '#fca5a5', '#86efac', '#fde68a',
  '#93c5fd', '#f9a8d4', '#fb923c', '#a78bfa'
];

const DEFAULT_PEOPLE = {
  'Me': { avatar: '' },
  'Nietzsche': { avatar: 'https://i.pravatar.cc/80?img=13' },
  'Kant': { avatar: 'https://i.pravatar.cc/80?img=14' },
  'Diogenes': { avatar: 'https://i.pravatar.cc/80?img=15' },
  'Aristoteles': { avatar: 'https://i.pravatar.cc/80?img=12' }
};

const DEFAULT_SCRIPT = `@add Aristoteles
@add Nietzsche
@add Kant

Aristoteles: Arkadaşlar, "iyi yaşam"ı tanımlamadan tartışmayalım.
@typing Nietzsche 800
Nietzsche: Tanrı öldü… ama grup admini hâlâ yaşıyor mu?
@typing Kant 1200
Kant > Nietzsche: Lütfen birbirinizi araç olarak kullanmayın.

@add Diogenes
@reaction Diogenes 😂 Nietzsche
@typing Diogenes 600
Diogenes: 🐕
@leave Diogenes

@system Nietzsche mesajını sildi
@typing Me 900
Me: Ya bi sakin… daha yeni başladık.`;

const SCRIPT_TEMPLATES = [
  {
    id: 'default',
    title: 'Felsefe Sohbeti',
    description: 'Varsayılan giriş senaryosu',
    script: DEFAULT_SCRIPT,
  },
  {
    id: 'welcome',
    title: 'Yeni Üye Karşılama',
    description: 'Hoş geldin mesajı ve kuralları paylaş',
    script: `@add Yeni Üye
@system Yeni Üye gruba katıldı
@typing Me 800
Me: Hoş geldin! Grup kurallarını yukarı tutturdum, göz atabilir misin?
@typing Yeni Üye 1200
Yeni Üye: Herkese selam! Kurallara baktım, süper görünüyor.
@typing Me 900
Me: Harika, ilk tanışma turuyla başlayalım.`,
  },
  {
    id: 'poll',
    title: 'Hızlı Oylama',
    description: 'Kısa soru-cevap akışı',
    script: `@add Sunucu
@add Katılımcı
@system Haftalık buluşma oylaması başlatıldı
Sunucu: Bu hafta buluşmayı cumartesi yapalım mı?
@reaction Katılımcı 👍 Sunucu
@typing Katılımcı 700
Katılımcı: Cumartesi bana uyar, saat kaç olsun?`,
  },
  {
    id: 'qa',
    title: 'Soru-Cevap',
    description: 'Uzun metin içeren cevap akışı',
    script: `@add Mentor
@add Öğrenci
@system Soru-Cevap oturumu başladı
Öğrenci: Temel prensipleri nasıl çalışmalıyım?
@typing Mentor 1500
Mentor > Öğrenci: Önce kısa notlar çıkar, sonra örneklerle pekiştir. Günün sonunda özetle.
@typing Öğrenci 900
Öğrenci: Tamamdır, bana yol haritası oldu bile.`,
  },
  {
    id: 'faz4-demo',
    title: 'Faz 4 — Medya Tipleri',
    description: 'Konum, döküman, sticker, link ve view-once örnekleri',
    script: `@add Ayşe
@add Mehmet
@typing Me 600
@location Me "İstanbul Havalimanı" "Terminal 1, Arnavutköy"
@typing Ayşe 800
Ayşe: Uçuşun ne zaman?
@typing Me 500
Me: 3 saat sonra 🙂
@typing Mehmet 700
@document Mehmet "bilet_istanbul.pdf" "1.2 MB · PDF"
@typing Ayşe 600
@sticker Ayşe ✈️
@typing Me 900
@link Me "İstanbul Havalimanı — Resmi Site" "https://igairport.aero"
@typing Ayşe 700
@viewonce Ayşe photo
Ayşe: Havalimanından güzel bir selfie 📸`,
  },
  {
    id: 'interactive-demo',
    title: '🎮 İnteraktif — Müşteri Destek',
    description: 'Koşullu mesajlaşma demo senaryosu (Faz 7)',
    script: `#selamlasma
trigger: merhaba, selam, hey, naber
---
@typing Destek 800
Destek: Merhaba! 👋 Size nasıl yardımcı olabilirim?
@typing Destek 600
Destek: Kargo, iade veya sipariş hakkında bilgi alabilirsiniz.

#kargo
trigger: kargo, kargom, teslimat, nerede
---
@typing Destek 1000
Destek: Kargonuz şu an dağıtıma çıkmış durumda. 🚚
@typing Destek 800
Destek: Tahmini teslimat: bugün 14:00-18:00 arası.
@typing Destek 500
@location Destek "Kargo Dağıtım Merkezi" "Antalya, Muratpaşa"

#iade
trigger: iade, değişim, geri, iptal
---
@typing Destek 900
Destek: İade işlemi için sipariş numaranızı paylaşır mısınız?
@typing Destek 700
Destek: 14 gün içinde ücretsiz iade yapabilirsiniz.
@typing Destek 600
@document Destek "iade_formu.pdf" "245 KB · PDF"

#tesekkur
trigger: teşekkürler, sağol, eyvallah, tşk
---
@typing Destek 600
Destek: Rica ederim! 😊
@typing Destek 500
Destek: Başka bir sorunuz olursa yazabilirsiniz.

#default
trigger: *
---
@typing Destek 800
Destek: Bunu tam anlayamadım 🤔
@typing Destek 600
Destek: "kargo", "iade" veya "merhaba" yazarak başlayabilirsiniz.`,
  },
];

const WALLPAPER_PRESETS = {
  // Default: WhatsApp dark mod — katmanlı geometrik desen + soft ışık
  default: {
    background: `
      radial-gradient(ellipse 70% 40% at 15% 8%, rgba(37,211,102,.04), transparent),
      radial-gradient(ellipse 50% 30% at 85% 5%, rgba(11,20,26,.35), transparent),
      radial-gradient(ellipse 80% 60% at 50% 95%, rgba(0,0,0,.28), transparent),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cstyle%3E.a%7Bfill:%23162830%3Bfill-opacity:.28%7D%3C/style%3E%3C/defs%3E%3Cg%3E%3Ccircle class='a' cx='20' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='380' r='1.4'/%3E%3C/g%3E%3C/svg%3E"),
      linear-gradient(180deg, #091014 0%, #0b141a 45%, #0a1318 100%)`,
    size: 'auto, auto, auto, 400px 400px, auto',
    blend: 'normal, normal, normal, overlay, normal'
  },

  // Velvet: Yumuşak derinlik katmanları
  velvet: {
    background: `
      radial-gradient(ellipse 60% 50% at 20% 15%, rgba(37,211,102,.035), transparent),
      radial-gradient(ellipse 70% 40% at 80% 85%, rgba(0,92,75,.06), transparent),
      radial-gradient(ellipse 100% 80% at 50% 50%, rgba(13,22,29,.6), transparent),
      linear-gradient(180deg, #0e1c23 0%, #0b141a 100%)`,
    size: 'auto',
    blend: 'normal, normal, normal, normal'
  },

  // Graph: İnce grid çizgileri (subtle)
  graph: {
    background: `
      linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(180deg, rgba(255,255,255,.025) 1px, transparent 1px),
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,211,102,.03), transparent),
      linear-gradient(180deg, #0b141a 0%, #0d1b22 100%)`,
    size: '40px 40px, 40px 40px, auto, auto',
    blend: 'normal, normal, normal, normal'
  },

  // Plain: Sade, tam siyah
  plain: {
    background: 'linear-gradient(180deg, #0c161c 0%, #0b141a 100%)',
    size: 'auto',
    blend: 'normal'
  },

  // Light Default: WhatsApp light mod — bej tonlu doodle pattern
  'light-default': {
    background: `
      radial-gradient(ellipse 70% 40% at 15% 8%, rgba(0,128,105,.04), transparent),
      radial-gradient(ellipse 50% 30% at 85% 5%, rgba(239,234,226,.35), transparent),
      radial-gradient(ellipse 80% 60% at 50% 95%, rgba(0,0,0,.04), transparent),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cstyle%3E.a%7Bfill:%23c8b89a%3Bfill-opacity:.12%7D%3C/style%3E%3C/defs%3E%3Cg%3E%3Ccircle class='a' cx='20' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='20' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='60' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='100' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='140' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='180' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='220' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='260' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='300' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='340' r='1.4'/%3E%3Ccircle class='a' cx='20' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='60' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='100' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='140' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='180' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='220' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='260' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='300' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='340' cy='380' r='1.4'/%3E%3Ccircle class='a' cx='380' cy='380' r='1.4'/%3E%3C/g%3E%3C/svg%3E"),
      linear-gradient(180deg, #ece5dd 0%, #efeae2 45%, #e4ddd4 100%)`,
    size: 'auto, auto, auto, 400px 400px, auto',
    blend: 'normal, normal, normal, overlay, normal'
  },

  // Light Plain: Sade, açık bej
  'light-plain': {
    background: 'linear-gradient(180deg, #ece5dd 0%, #efeae2 100%)',
    size: 'auto',
    blend: 'normal'
  }
};

const DEFAULT_STATE = {
  // Theme
  theme: 'dark',

  // Group
  groupTitle: 'Felsefe Grubu',
  groupSubtitle: 'Online',
  dayLabel: 'Bugün',
  groupPhotoUrl: '',
  groupAvatarDataUrl: null,

  // Settings
  statusTimeOverride: '',
  wallpaperPreset: 'default',
  wallpaperColor: '#0b141a',
  wallpaperImageDataUrl: null,
  batteryVisible: true,
  batteryPercent: 95,
  batteryHealth: 100,
  chatFontSize: 14,
  chatLineHeight: 1.4,
  bubbleSize: 78,
  bubblePaddingY: 10,
  headerColor: '#1f2c33',
  bubbleOutColor: null,
  bubbleInColor: null,
  tickStatus: 'read',

  // Message Times
  messageTimesAuto: true,
  messageBaseTime: null, // Will be set to current time
  messageIncrement: 1,

  // Player
  speed: 900,
  jitter: 250,
  script: ''
};
