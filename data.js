/* ==========================================================================
   فاکتوریار — Static data: trades, icons, default catalog
   ========================================================================== */
(function (global) {
  'use strict';

  /** Stroke-based 24x24 icons (no emoji — renders identically in PDF/print) */
  var ICONS = {
    roller: '<rect x="3" y="4" width="12" height="5.2" rx="1.6"/><path d="M15 6.6h3.4A1.6 1.6 0 0 1 20 8.2v2.6a1.6 1.6 0 0 1-1.6 1.6H11a1.5 1.5 0 0 0-1.5 1.5V16"/><rect x="7.4" y="16" width="4.2" height="5" rx="1.2"/>',
    bolt: '<path d="M13.6 2.2 4.2 13.6h5.9L9.4 21.8l9.4-11.4h-5.9z"/>',
    pipe: '<path d="M3.5 8.2h5.6a3 3 0 0 1 3 3v1.6a3 3 0 0 0 3 3h5.4"/><rect x="1.6" y="5.4" width="3" height="5.6" rx="1"/><rect x="19.4" y="13" width="3" height="5.6" rx="1"/>',
    brick: '<rect x="2.6" y="4.6" width="18.8" height="14.8" rx="1.8"/><path d="M2.6 9.5h18.8M2.6 14.5h18.8M9 4.6v4.9M15.4 9.5v5M9 14.5v4.9"/>',
    tile: '<rect x="3" y="3" width="7.8" height="7.8" rx="1.4"/><rect x="13.2" y="3" width="7.8" height="7.8" rx="1.4"/><rect x="3" y="13.2" width="7.8" height="7.8" rx="1.4"/><rect x="13.2" y="13.2" width="7.8" height="7.8" rx="1.4"/>',
    trowel: '<path d="M2.9 12.3 11.9 3.3a2 2 0 0 1 2.8 0l6 6a2 2 0 0 1 0 2.9l-9 9z"/><path d="M9.2 16.1 15 10.3"/>',
    saw: '<path d="M3 16.4h18"/><path d="M3 16.4V8l3 3 3-3 3 3 3-3 3 3 3-3v8.4"/>',
    climate: '<path d="M12 2.4v19.2M3.1 12h17.8M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/><path d="M12 6.3 9.9 4.2M12 6.3l2.1-2.1M12 17.7l-2.1 2.1M12 17.7l2.1 2.1"/>',
    hammer: '<path d="M12.9 4.3 19.6 11l-2.6 2.6-2.1-2.1-7.4 7.4a2.05 2.05 0 1 1-2.9-2.9l7.4-7.4-2.1-2.1z"/>',
    stone: '<path d="M12 2.4 21 7.7v8.6L12 21.6 3 16.3V7.7z"/><path d="M3 7.7 12 13l9-5.3M12 13v8.6"/>',
    layers: '<path d="M12 2.6 22 8l-10 5.4L2 8z"/><path d="M2.4 12.6 12 17.8l9.6-5.2M2.4 16.9 12 22.1l9.6-5.2"/>',
    sparkle: '<path d="M11.6 3.2 13.5 9l5.8 1.9-5.8 1.9-1.9 5.8-1.9-5.8L3.9 10.9 9.7 9z"/><path d="M18.6 3v2.8M17.2 4.4H20M5.2 16.6v2.4M4.1 17.8h2.3"/>'
  };

  var TRADES = [
    { id: 'paint',    name: 'نقاشی ساختمان',              icon: ICONS.roller,  hue: '#E4753C' },
    { id: 'electric', name: 'برق‌کاری',                    icon: ICONS.bolt,    hue: '#E9B644' },
    { id: 'plumb',    name: 'لوله‌کشی',                    icon: ICONS.pipe,    hue: '#38A9C4' },
    { id: 'mason',    name: 'بنایی',                       icon: ICONS.brick,   hue: '#B4643C' },
    { id: 'tile',     name: 'کاشی‌کاری و سرامیک',          icon: ICONS.tile,    hue: '#8E6BA8' },
    { id: 'plaster',  name: 'گچ‌کاری و کناف',              icon: ICONS.trowel,  hue: '#C9A227' },
    { id: 'carpent',  name: 'نجاری و کابینت‌سازی',         icon: ICONS.saw,     hue: '#9A7B4F' },
    { id: 'hvac',     name: 'سرمایش و گرمایش',             icon: ICONS.climate, hue: '#5C93B8' },
    { id: 'metal',    name: 'آهنگری و درب و پنجره فلزی',   icon: ICONS.hammer,  hue: '#8E949C' },
    { id: 'stone',    name: 'سنگ‌کاری',                    icon: ICONS.stone,   hue: '#A3763F' },
    { id: 'insul',    name: 'عایق‌کاری و ایزوگام',         icon: ICONS.layers,  hue: '#6E9E4E' },
    { id: 'clean',    name: 'نظافت ساختمان',               icon: ICONS.sparkle, hue: '#34C08A' }
  ];

  /** Default price book. Prices are stored in Toman. */
  var DEFAULT_CATALOG = {
    paint: [
      { name: 'نقاشی رنگ روغنی (درجه یک)', unit: 'متر مربع', price: 300000 },
      { name: 'نقاشی پلاستیک (درجه دو)',    unit: 'متر مربع', price: 250000 },
      { name: 'بتونه‌کاری و آماده‌سازی',     unit: 'متر مربع', price: 80000 },
      { name: 'رنگ‌آمیزی درب و پنجره',       unit: 'عدد',      price: 400000 },
      { name: 'کناره‌کشی و پوشش نایلون',     unit: 'متر مربع', price: 20000 }
    ],
    electric: [
      { name: 'سیم‌کشی برق روکار',           unit: 'متر', price: 60000 },
      { name: 'نصب پریز یا کلید',            unit: 'عدد', price: 150000 },
      { name: 'نصب چراغ و روشنایی',          unit: 'عدد', price: 200000 },
      { name: 'نصب و راه‌اندازی تابلو برق',  unit: 'عدد', price: 1500000 },
      { name: 'عیب‌یابی و رفع اتصالی',       unit: 'مورد', price: 500000 }
    ],
    plumb: [
      { name: 'لوله‌کشی آب سرد و گرم', unit: 'متر',  price: 120000 },
      { name: 'نصب شیرآلات',           unit: 'عدد',  price: 250000 },
      { name: 'رفع گرفتگی لوله',       unit: 'مورد', price: 400000 },
      { name: 'نصب توالت فرنگی',       unit: 'عدد',  price: 900000 }
    ],
    mason: [
      { name: 'دیوارچینی سفالی', unit: 'متر مربع', price: 350000 },
      { name: 'گچ و خاک',        unit: 'متر مربع', price: 150000 },
      { name: 'سیمان‌کاری کف',   unit: 'متر مربع', price: 200000 },
      { name: 'تخریب و نخاله‌برداری', unit: 'متر مربع', price: 180000 }
    ],
    tile: [
      { name: 'نصب کاشی دیوار',   unit: 'متر مربع', price: 280000 },
      { name: 'نصب سرامیک کف',    unit: 'متر مربع', price: 320000 },
      { name: 'بندکشی',           unit: 'متر مربع', price: 60000 },
      { name: 'نصب کفپوش پرسلان', unit: 'متر مربع', price: 420000 }
    ],
    plaster: [
      { name: 'گچ‌کاری سقف و دیوار', unit: 'متر مربع', price: 180000 },
      { name: 'سقف کاذب کناف',       unit: 'متر مربع', price: 250000 },
      { name: 'نورمخفی و ابزار گچی', unit: 'متر',      price: 220000 }
    ],
    carpent: [
      { name: 'کابینت MDF',        unit: 'متر', price: 3500000 },
      { name: 'درب چوبی اتاق',     unit: 'عدد', price: 2500000 },
      { name: 'نصب کمد دیواری',    unit: 'عدد', price: 4000000 },
      { name: 'تعمیر و تنظیم درب', unit: 'مورد', price: 350000 }
    ],
    hvac: [
      { name: 'نصب کولر گازی',        unit: 'عدد', price: 800000 },
      { name: 'نصب پکیج و رادیاتور',  unit: 'عدد', price: 3000000 },
      { name: 'لوله‌کشی گاز',         unit: 'متر', price: 150000 },
      { name: 'سرویس سالانه پکیج',    unit: 'مورد', price: 650000 }
    ],
    metal: [
      { name: 'ساخت درب فلزی',    unit: 'متر مربع', price: 1200000 },
      { name: 'نصب حفاظ پنجره',   unit: 'متر مربع', price: 600000 },
      { name: 'جوشکاری در محل',   unit: 'ساعت',     price: 450000 }
    ],
    stone: [
      { name: 'نصب سنگ نما',  unit: 'متر مربع', price: 450000 },
      { name: 'نصب سنگ کف',   unit: 'متر مربع', price: 400000 },
      { name: 'ساب و پولیش',  unit: 'متر مربع', price: 160000 }
    ],
    insul: [
      { name: 'ایزوگام پشت‌بام',  unit: 'متر مربع', price: 180000 },
      { name: 'عایق‌کاری رطوبتی', unit: 'متر مربع', price: 120000 },
      { name: 'عایق حرارتی دیوار', unit: 'متر مربع', price: 210000 }
    ],
    clean: [
      { name: 'نظافت پس از ساخت', unit: 'متر مربع', price: 25000 },
      { name: 'نظافت راه‌پله',    unit: 'متر مربع', price: 15000 },
      { name: 'شست‌وشوی نما',     unit: 'متر مربع', price: 90000 }
    ]
  };

  var STATUSES = {
    draft:   { label: 'پیش‌نویس',       tone: 'neutral' },
    pending: { label: 'در انتظار پرداخت', tone: 'brass' },
    partial: { label: 'پرداخت جزئی',     tone: 'copper' },
    paid:    { label: 'تسویه‌شده',       tone: 'jade' },
    cancel:  { label: 'لغو‌شده',         tone: 'rust' }
  };

  global.FK_DATA = {
    TRADES: TRADES,
    DEFAULT_CATALOG: DEFAULT_CATALOG,
    STATUSES: STATUSES,
    tradeById: function (id) {
      for (var i = 0; i < TRADES.length; i++) if (TRADES[i].id === id) return TRADES[i];
      return TRADES[0];
    }
  };
})(window);
