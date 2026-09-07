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
    { id: 'paint',    name: 'نقاشی ساختمان',              icon: ICONS.roller,  hue: '#E4753C' }
  ];

  /** Default price book. Prices are stored in Toman. */
  var DEFAULT_CATALOG = {
    paint: [
      { name: 'نقاشی رنگ روغنی (درجه یک)', unit: 'متر مربع', price: 300000 },
      { name: 'نقاشی پلاستیک (درجه دو)',    unit: 'متر مربع', price: 250000 },
      { name: 'بتونه‌کاری و آماده‌سازی',     unit: 'متر مربع', price: 80000 },
      { name: 'رنگ‌آمیزی درب و پنجره',       unit: 'عدد',      price: 400000 },
      { name: 'کناره‌کشی و پوشش نایلون',     unit: 'متر مربع', price: 20000 }
    ]
  };

  /** Paint calculator: coverage per liter is m² per 1L for a single coat. */
  var PAINT_TYPES = [
    { id: 'plastic', name: 'پلاستیک (مات / نیمه‌براق)',   coveragePerLiter: 11, defaultCoats: 2 },
    { id: 'acrylic', name: 'اکریلیک درجه یک',              coveragePerLiter: 12, defaultCoats: 2 },
    { id: 'oil',     name: 'روغنی (براق)',                 coveragePerLiter: 9,  defaultCoats: 2 },
    { id: 'primer',  name: 'بتونه + آستری (دیوار نوساز)',   coveragePerLiter: 7,  defaultCoats: 1 }
  ];

  /** Standard container sizes sold in the market, largest first. */
  var PAINT_CONTAINERS = [
    { size: 25, label: 'قوطی ۲۵ لیتری' },
    { size: 9,  label: 'قوطی ۹ لیتری' },
    { size: 3,  label: 'قوطی ۳ لیتری' },
    { size: 1,  label: 'قوطی ۱ لیتری' }
  ];

  var PAINT_COLORS = [
    { id: 'white',       name: 'سفید',            hex: '#F4F1EA' },
    { id: 'cream',       name: 'کرم',              hex: '#E8DCC0' },
    { id: 'beige',       name: 'بژ',               hex: '#D7C29E' },
    { id: 'sand',        name: 'شنی',              hex: '#CBAE82' },
    { id: 'lightgray',   name: 'طوسی روشن',        hex: '#C6CAD0' },
    { id: 'gray',        name: 'طوسی',             hex: '#8D949C' },
    { id: 'skyblue',     name: 'آبی روشن',         hex: '#A9C3D4' },
    { id: 'sage',        name: 'سبز زیتونی',       hex: '#A2AC87' },
    { id: 'terracotta',  name: 'کرم‌سوخته',        hex: '#C08258' },
    { id: 'charcoal',    name: 'دودی تیره',        hex: '#484C51' }
  ];

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
    PAINT_TYPES: PAINT_TYPES,
    PAINT_CONTAINERS: PAINT_CONTAINERS,
    PAINT_COLORS: PAINT_COLORS,
    tradeById: function (id) {
      for (var i = 0; i < TRADES.length; i++) if (TRADES[i].id === id) return TRADES[i];
      return TRADES[0];
    },
    paintTypeById: function (id) {
      for (var i = 0; i < PAINT_TYPES.length; i++) if (PAINT_TYPES[i].id === id) return PAINT_TYPES[i];
      return PAINT_TYPES[0];
    },
    paintColorById: function (id) {
      for (var i = 0; i < PAINT_COLORS.length; i++) if (PAINT_COLORS[i].id === id) return PAINT_COLORS[i];
      return PAINT_COLORS[0];
    }
  };
})(window);
