/* ==========================================================================
   فاکتوریار — Core: utils, Jalali calendar, storage
   ========================================================================== */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. Safety & text
   * ------------------------------------------------------------------ */
  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  /** Escape any value before it touches innerHTML. */
  function esc(v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }

  var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  var AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

  /** Convert Persian/Arabic digits + Arabic decimal separators to ASCII. */
  function toEnDigits(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/[۰-۹]/g, function (d) { return String(FA_DIGITS.indexOf(d)); })
      .replace(/[٠-٩]/g, function (d) { return String(AR_DIGITS.indexOf(d)); })
      .replace(/٫/g, '.')
      .replace(/[،٬]/g, ',');
  }

  function toFaDigits(s) {
    return String(s).replace(/\d/g, function (d) { return FA_DIGITS[+d]; });
  }

  /** Normalize for search: ASCII digits, unified ی/ک, collapsed spaces. */
  function normalize(s) {
    return toEnDigits(s)
      .replace(/[يى]/g, 'ی')
      .replace(/[كک]/g, 'ک')
      .replace(/\u200c/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /* ------------------------------------------------------------------ *
   * 2. Numbers & money
   * ------------------------------------------------------------------ */
  function num(v) {
    var n = parseFloat(toEnDigits(v).replace(/,/g, ''));
    return isFinite(n) ? n : 0;
  }

  /** Group digits, render in Persian numerals. Keeps up to 2 decimals. */
  function faNum(v) {
    var n = num(v);
    var neg = n < 0;
    n = Math.abs(n);
    var rounded = Math.round(n * 100) / 100;
    var intPart = Math.floor(rounded);
    var frac = Math.round((rounded - intPart) * 100);
    var out = toFaDigits(String(intPart).replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
    if (frac > 0) out += '٫' + toFaDigits(frac < 10 ? String(frac) : String(frac)).replace(/0$/, '');
    return (neg ? '−' : '') + out;
  }

  /** Latin grouped digits — used inside editable inputs. */
  function grouped(v) {
    var n = Math.round(num(v));
    return n ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  }

  var Money = {
    currency: 'toman',
    unit: function () { return Money.currency === 'rial' ? 'ریال' : 'تومان'; },
    /** Values are stored in Toman; Rial display multiplies by 10. */
    display: function (n) { return Money.currency === 'rial' ? num(n) * 10 : num(n); },
    fmt: function (n) { return faNum(Math.round(Money.display(n))); },
    full: function (n) { return Money.fmt(n) + ' ' + Money.unit(); }
  };

  /* ------------------------------------------------------------------ *
   * 3. Number → Persian words
   * ------------------------------------------------------------------ */
  var ONES = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  var TEENS = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  var TENS = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  var HUNDREDS = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  var SCALES = ['', 'هزار', 'میلیون', 'میلیارد', 'بیلیون'];

  function tripletWords(n) {
    if (!n) return '';
    var parts = [];
    var h = Math.floor(n / 100);
    var r = n % 100;
    if (h) parts.push(HUNDREDS[h]);
    if (r) {
      if (r < 10) parts.push(ONES[r]);
      else if (r < 20) parts.push(TEENS[r - 10]);
      else {
        var t = Math.floor(r / 10), o = r % 10;
        parts.push(o ? TENS[t] + ' و ' + ONES[o] : TENS[t]);
      }
    }
    return parts.join(' و ');
  }

  /** 1000 → «هزار» (not «یک هزار»); handles negatives. */
  function words(value) {
    var n = Math.round(num(value));
    if (n === 0) return 'صفر';
    var sign = n < 0 ? 'منفی ' : '';
    n = Math.abs(n);

    var groups = [];
    while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); }

    var out = [];
    for (var i = groups.length - 1; i >= 0; i--) {
      if (!groups[i]) continue;
      var w = tripletWords(groups[i]);
      if (i === 1 && groups[i] === 1) w = '';          // «هزار» نه «یک هزار»
      out.push((w ? w + ' ' : '') + SCALES[i]);
    }
    return sign + out.join(' و ').replace(/\s+/g, ' ').trim();
  }

  /* ------------------------------------------------------------------ *
   * 4. Jalali (Shamsi) calendar engine
   * ------------------------------------------------------------------ */
  var J_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  var J_WEEK = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  function div(a, b) { return ~~(a / b); }
  function mod(a, b) { return a - ~~(a / b) * b; }

  var BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
                1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

  function jalCal(jy) {
    var bl = BREAKS.length, gy = jy + 621, leapJ = -14, jp = BREAKS[0];
    var jm, jump = 0, leap, n, i;
    if (jy < jp || jy >= BREAKS[bl - 1]) throw new Error('Jalaali year out of range: ' + jy);
    for (i = 1; i < bl; i++) {
      jm = BREAKS[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ++;
    var leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    var march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return { leap: leap, gy: gy, march: march };
  }

  function g2d(gy, gm, gd) {
    var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
          + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
    return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  }

  function d2g(jdn) {
    var j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    var i = div(mod(j, 1461), 4) * 5 + 308;
    var gd = div(mod(i, 153), 5) + 1;
    var gm = mod(div(i, 153), 12) + 1;
    var gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy: gy, gm: gm, gd: gd };
  }

  function toJalali(gy, gm, gd) {
    var jdn = g2d(gy, gm, gd);
    var gyy = d2g(jdn).gy, jy = gyy - 621;
    var r = jalCal(jy), jdn1f = g2d(gyy, 3, r.march), jd, jm, k = jdn - jdn1f;
    if (k >= 0) {
      if (k <= 185) return { jy: jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
      k -= 186;
    } else {
      jy--; k += 179;
      if (r.leap === 1) k++;
    }
    jm = 7 + div(k, 30);
    jd = mod(k, 30) + 1;
    return { jy: jy, jm: jm, jd: jd };
  }

  function toGregorian(jy, jm, jd) {
    var r = jalCal(jy);
    return d2g(g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1);
  }

  function isLeapJ(jy) { return jalCal(jy).leap === 0; }

  function jMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJ(jy) ? 30 : 29;
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /** Local (not UTC) ISO date for today — avoids timezone drift. */
  function todayIso() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function parseIso(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return null;
    return { gy: +m[1], gm: +m[2], gd: +m[3] };
  }

  function isoToJ(iso) {
    var g = parseIso(iso);
    return g ? toJalali(g.gy, g.gm, g.gd) : null;
  }

  function jToIso(jy, jm, jd) {
    var g = toGregorian(jy, jm, jd);
    return g.gy + '-' + pad2(g.gm) + '-' + pad2(g.gd);
  }

  /** style: 'long' → ۲۶ مرداد ۱۴۰۵ | 'short' → ۲۶ مرداد | 'numeric' → ۱۴۰۵/۰۵/۲۶ */
  function jFormat(iso, style) {
    var j = isoToJ(iso);
    if (!j) return '—';
    if (style === 'numeric') return toFaDigits(j.jy + '/' + pad2(j.jm) + '/' + pad2(j.jd));
    if (style === 'short') return toFaDigits(j.jd) + ' ' + J_MONTHS[j.jm - 1];
    return toFaDigits(j.jd) + ' ' + J_MONTHS[j.jm - 1] + ' ' + toFaDigits(j.jy);
  }

  /** Jalali month bucket key, e.g. "1405-05" — for correct monthly reports. */
  function jMonthKey(iso) {
    var j = isoToJ(iso);
    return j ? j.jy + '-' + pad2(j.jm) : '';
  }

  /** Shift a Jalali month key by `offset` months (negative = past). */
  function jShiftKey(jy, jm, offset) {
    var total = jy * 12 + (jm - 1) + offset;
    return { jy: div(total, 12), jm: mod(total, 12) + 1 };
  }

  function jToday() {
    return isoToJ(todayIso());
  }

  /** Weekday column index in a Saturday-first grid. */
  function jWeekCol(jy, jm, jd) {
    var g = toGregorian(jy, jm, jd);
    var d = new Date(g.gy, g.gm - 1, g.gd);
    return (d.getDay() + 1) % 7;
  }

  function daysBetween(isoA, isoB) {
    var a = parseIso(isoA), b = parseIso(isoB);
    if (!a || !b) return 0;
    return g2d(b.gy, b.gm, b.gd) - g2d(a.gy, a.gm, a.gd);
  }

  /* ------------------------------------------------------------------ *
   * 5. Misc helpers
   * ------------------------------------------------------------------ */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms || 200);
    };
  }

  /** Downscale an uploaded image to a data URL so it never blows the quota. */
  function downscaleImage(file, maxSize, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var type = /png|svg/i.test(file.type) ? 'image/png' : 'image/jpeg';
        cb(null, c.toDataURL(type, 0.86));
      };
      img.onerror = function () { cb(new Error('فایل تصویر معتبر نیست')); };
      img.src = reader.result;
    };
    reader.onerror = function () { cb(new Error('خواندن فایل ناموفق بود')); };
    reader.readAsDataURL(file);
  }

  /* ------------------------------------------------------------------ *
   * 6. Storage — real localStorage, real errors, real migrations
   * ------------------------------------------------------------------ */
  var KEY = 'faktoryar.db';
  var SCHEMA = 1;

  function baseState() {
    return {
      schema: SCHEMA,
      seq: 1,
      profile: {
        businessName: '',
        owner: '',
        phone: '',
        address: '',
        nationalId: '',
        logo: '',
        prefix: 'FK',
        nextNum: 1001,
        trade: 'paint',
        currency: 'toman',
        vatRate: 0,
        theme: 'dark',
        terms: 'پرداخت حداکثر تا ۷ روز پس از تحویل کار. ضمانت اجرا به مدت ۶ ماه.'
      },
      clients: [],
      catalog: clone(global.FK_DATA.DEFAULT_CATALOG),
      invoices: []
    };
  }

  var Store = {
    available: true,
    lastError: null,

    probe: function () {
      try {
        var t = '__fk_probe__';
        localStorage.setItem(t, '1');
        localStorage.removeItem(t);
        Store.available = true;
      } catch (e) {
        Store.available = false;
        Store.lastError = e;
      }
      return Store.available;
    },

    load: function () {
      var fresh = baseState();
      if (!Store.probe()) return fresh;
      var raw;
      try {
        raw = localStorage.getItem(KEY);
      } catch (e) {
        console.error('[faktoryar] read failed', e);
        return fresh;
      }
      if (!raw) return fresh;

      var data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error('[faktoryar] corrupt payload, keeping a rescue copy', e);
        try { localStorage.setItem(KEY + '.corrupt.' + Date.now(), raw); } catch (_) {}
        return fresh;
      }
      return Store.migrate(data, fresh);
    },

    /** Merge stored data over defaults so new fields/trades always appear. */
    migrate: function (data, fresh) {
      var s = fresh;
      s.schema = SCHEMA;
      s.seq = Math.max(1, +data.seq || 1);

      if (data.profile) {
        for (var k in s.profile) {
          if (Object.prototype.hasOwnProperty.call(data.profile, k) &&
              data.profile[k] !== null && data.profile[k] !== undefined) {
            s.profile[k] = data.profile[k];
          }
        }
      }
      s.clients = Array.isArray(data.clients) ? data.clients : [];
      s.invoices = Array.isArray(data.invoices) ? data.invoices : [];

      // Catalog: keep user's list per trade, but introduce trades added later.
      if (data.catalog && typeof data.catalog === 'object') {
        for (var t in s.catalog) {
          if (Array.isArray(data.catalog[t])) s.catalog[t] = data.catalog[t];
        }
        for (var extra in data.catalog) {
          if (!s.catalog[extra] && Array.isArray(data.catalog[extra])) {
            s.catalog[extra] = data.catalog[extra];
          }
        }
      }

      // Backfill ids so nothing collides after an import.
      var maxId = 0;
      function scan(list) {
        (list || []).forEach(function (x) { if (+x.id > maxId) maxId = +x.id; });
      }
      scan(s.clients); scan(s.invoices);
      if (maxId >= s.seq) s.seq = maxId + 1;
      return s;
    },

    save: function (state) {
      if (!Store.available) return { ok: false, reason: 'unavailable' };
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        return { ok: true };
      } catch (e) {
        console.error('[faktoryar] write failed', e);
        Store.lastError = e;
        var quota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
        return { ok: false, reason: quota ? 'quota' : 'unknown', error: e };
      }
    },

    exportBlob: function (state) {
      var payload = clone(state);
      payload.exportedAt = new Date().toISOString();
      payload.app = 'faktoryar';
      return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    },

    importText: function (text) {
      var data = JSON.parse(text);
      if (!data || typeof data !== 'object' || (!data.invoices && !data.clients && !data.profile)) {
        throw new Error('ساختار فایل پشتیبان شناخته نشد');
      }
      return Store.migrate(data, baseState());
    },

    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) { console.error(e); }
      return baseState();
    }
  };

  /* ------------------------------------------------------------------ *
   * Export
   * ------------------------------------------------------------------ */
  global.FK = {
    esc: esc,
    toEnDigits: toEnDigits,
    toFaDigits: toFaDigits,
    normalize: normalize,
    num: num,
    faNum: faNum,
    grouped: grouped,
    Money: Money,
    words: words,
    clone: clone,
    debounce: debounce,
    downscaleImage: downscaleImage,
    pad2: pad2,
    // calendar
    J_MONTHS: J_MONTHS,
    J_WEEK: J_WEEK,
    todayIso: todayIso,
    isoToJ: isoToJ,
    jToIso: jToIso,
    jFormat: jFormat,
    jMonthKey: jMonthKey,
    jShiftKey: jShiftKey,
    jMonthLength: jMonthLength,
    jWeekCol: jWeekCol,
    jToday: jToday,
    daysBetween: daysBetween,
    Store: Store,
    baseState: baseState
  };
})(window);
