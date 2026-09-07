/* ==========================================================================
   فاکتوریار — App controller (uses window.FK + window.FK_DATA + theme.css)
   ========================================================================== */
(function () {
  'use strict';

  var FK = window.FK, FD = window.FK_DATA;
  var DB = FK.Store.load();

  var UI = {
    view: 'dash',
    invEdit: null,      // invoice object currently being edited in the form (or null = new)
    invFilterStatus: 'all',
    invSearch: '',
    clientSearch: '',
    catalogTrade: DB.profile.trade || 'paint',
    pickerTarget: null  // callback for item-picker modal
  };

  /* ------------------------------------------------------------------ *
   * Small UI icon set (nav + actions) — stroke based, matches trade icons
   * ------------------------------------------------------------------ */
  var ICO = {
    dash: '<path d="M3 12 12 4l9 8"/><path d="M5 10.5V20h14v-9.5"/><path d="M9.5 20v-6h5v6"/>',
    plus: '<path d="M12 4.5v15M4.5 12h15"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.4"/><circle cx="3.5" cy="12" r="1.4"/><circle cx="3.5" cy="18" r="1.4"/>',
    users: '<circle cx="8.5" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2c2.7.3 4.9 2.5 5 5.8"/>',
    book: '<path d="M4 4.5A1.7 1.7 0 0 1 5.7 3H19v17H5.7A1.7 1.7 0 0 1 4 18.3z"/><path d="M4 18.3A1.7 1.7 0 0 1 5.7 17H19"/>',
    gear: '<circle cx="12" cy="12" r="3.1"/><path d="M12 3.2v2.6M12 18.2v2.6M20.8 12h-2.6M5.8 12H3.2M17.9 6.1l-1.8 1.8M7.9 16.1l-1.8 1.8M17.9 17.9l-1.8-1.8M7.9 7.9 6.1 6.1"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>',
    trash: '<path d="M4 7h16M9 7V4.8A1.3 1.3 0 0 1 10.3 3.5h3.4A1.3 1.3 0 0 1 15 4.8V7M6.5 7l1 12.5A1.6 1.6 0 0 0 9.1 21h5.8a1.6 1.6 0 0 0 1.6-1.5l1-12.5"/>',
    edit: '<path d="M14.5 4.5 19.5 9.5 8 21H3v-5z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    dup: '<rect x="8.5" y="8.5" width="12" height="12" rx="1.8"/><path d="M15.5 8.5V5.3A1.8 1.8 0 0 0 13.7 3.5H5.3A1.8 1.8 0 0 0 3.5 5.3v8.4a1.8 1.8 0 0 0 1.8 1.8h3.2"/>',
    check: '<path d="M4 12.5 9.5 18 20 5.5"/>',
    x: '<path d="M5 5l14 14M19 5 5 19"/>',
    print: '<path d="M6 9V3.5h12V9"/><rect x="4" y="9" width="16" height="8" rx="1.6"/><rect x="7" y="13.2" width="10" height="7.3" rx="0.8"/>',
    download: '<path d="M12 3.5v12M7 11l5 5 5-5"/><path d="M4.5 19.5h15"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3"/>',
    moon: '<path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2z"/>',
    upload: '<path d="M12 20.5v-12M7 12.5l5-5 5 5"/><path d="M4.5 4.5h15"/>',
    money: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v.01M18 15v.01"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    phone: '<path d="M6.6 3.5h3l1.6 4.4-2 1.7a13 13 0 0 0 5.2 5.2l1.7-2 4.4 1.6v3a1.6 1.6 0 0 1-1.7 1.6A17 17 0 0 1 4.9 5.2 1.6 1.6 0 0 1 6.6 3.5z"/>',
    back: '<path d="M15 5 8 12l7 7"/>'
  };
  function svg(name, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24">' + ICO[name] + '</svg>'; }

  /* ------------------------------------------------------------------ *
   * Bootstrapping / persistence
   * ------------------------------------------------------------------ */
  function persist() {
    var r = FK.Store.save(DB);
    if (!r.ok) {
      toast(r.reason === 'quota' ? 'حافظه مرورگر پر شده — یک پشتیبان بگیرید و داده‌های قدیمی را حذف کنید' : 'ذخیره‌سازی ناموفق بود', 'rust');
    }
    return r.ok;
  }

  function toast(msg, tone) {
    var box = document.getElementById('toasts');
    var el = document.createElement('div');
    el.className = 'toast' + (tone ? ' ' + tone : '');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 3200);
  }

  /* ------------------------------------------------------------------ *
   * Modal helpers
   * ------------------------------------------------------------------ */
  function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
  function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

  function confirmDialog(title, body, onYes) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmBody').textContent = body;
    var yes = document.getElementById('confirmYes');
    var clone = yes.cloneNode(true);
    yes.parentNode.replaceChild(clone, yes);
    clone.addEventListener('click', function () { closeModal('confirmOverlay'); onYes(); });
    openModal('confirmOverlay');
  }

  document.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(b.getAttribute('data-close')); });
  });
  document.querySelectorAll('.overlay').forEach(function (ov) {
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) ov.classList.add('hidden'); });
  });

  /* ------------------------------------------------------------------ *
   * Theme
   * ------------------------------------------------------------------ */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.getElementById('themeLight').classList.toggle('active', t === 'light');
    document.getElementById('themeDark').classList.toggle('active', t === 'dark');
  }
  applyTheme(DB.profile.theme === 'light' ? 'light' : 'dark');
  document.getElementById('themeLight').addEventListener('click', function () { DB.profile.theme = 'light'; applyTheme('light'); persist(); });
  document.getElementById('themeDark').addEventListener('click', function () { DB.profile.theme = 'dark'; applyTheme('dark'); persist(); });

  /* ------------------------------------------------------------------ *
   * Rail / navigation
   * ------------------------------------------------------------------ */
  var NAV = [
    { id: 'dash', label: 'داشبورد', ico: 'dash' },
    { id: 'new', label: 'فاکتور جدید', ico: 'plus' },
    { id: 'invoices', label: 'فاکتورها', ico: 'list' },
    { id: 'clients', label: 'مشتریان', ico: 'users' },
    { id: 'catalog', label: 'قیمت‌نامه', ico: 'book' },
    { id: 'settings', label: 'تنظیمات', ico: 'gear' }
  ];

  function renderNav() {
    var rail = document.getElementById('navList');
    rail.innerHTML = NAV.map(function (n) {
      var count = n.id === 'invoices' ? DB.invoices.length : (n.id === 'clients' ? DB.clients.length : null);
      return '<button class="nav-item' + (UI.view === n.id ? ' active' : '') + '" data-nav="' + n.id + '">' +
        svg(n.ico) + '<span>' + n.label + '</span>' +
        (count !== null ? '<span class="count">' + FK.toFaDigits(count) + '</span>' : '') +
        '</button>';
    }).join('');
    rail.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-nav')); closeRail(); });
    });
  }

  function openRail() {
    document.getElementById('rail').classList.add('open');
    document.getElementById('railBackdrop').classList.add('open');
    document.body.classList.add('rail-locked');
  }

  function closeRail() {
    document.getElementById('rail').classList.remove('open');
    document.getElementById('railBackdrop').classList.remove('open');
    document.body.classList.remove('rail-locked');
  }

  function go(view, opts) {
    UI.view = view;
    if (view === 'new' && (!opts || !opts.keepDraft)) UI.invEdit = null;
    document.querySelectorAll('.view').forEach(function (v) { v.classList.add('hidden'); });
    document.getElementById('view-' + view).classList.remove('hidden');
    renderNav();
    RENDER[view]();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  document.getElementById('railToggle').addEventListener('click', function () {
    if (document.getElementById('rail').classList.contains('open')) closeRail(); else openRail();
  });
  document.getElementById('railBackdrop').addEventListener('click', closeRail);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeRail(); });

  /* ------------------------------------------------------------------ *
   * Trade helpers
   * ------------------------------------------------------------------ */
  function tradeIcoSpan(tradeId, cls) {
    var t = FD.tradeById(tradeId);
    return '<svg class="' + (cls || 'trade-ico-sm') + '" style="--tc:' + t.hue + '" viewBox="0 0 24 24">' + t.icon + '</svg>';
  }

  /* ------------------------------------------------------------------ *
   * DASHBOARD
   * ------------------------------------------------------------------ */
  var revenueChart = null;

  function renderDash() {
    var el = document.getElementById('view-dash');
    var invs = DB.invoices;
    var totalAll = 0, totalPending = 0, countThisMonth = 0, totalThisMonth = 0;
    var thisKey = FK.jMonthKey(FK.todayIso());
    invs.forEach(function (inv) {
      var t = invTotals(inv);
      if (inv.status !== 'cancel') totalAll += t.grand;
      if (inv.status === 'pending' || inv.status === 'partial') totalPending += (t.grand - (inv.paidAmount || 0));
      if (FK.jMonthKey(inv.date) === thisKey && inv.status !== 'cancel') { countThisMonth++; totalThisMonth += t.grand; }
    });

    // last 6 months series
    var jt = FK.jToday(), months = [], sums = [];
    for (var i = 5; i >= 0; i--) {
      var k = FK.jShiftKey(jt.jy, jt.jm, -i);
      var key = k.jy + '-' + FK.pad2(k.jm);
      months.push(FK.J_MONTHS[k.jm - 1]);
      var sum = 0;
      invs.forEach(function (inv) { if (inv.status !== 'cancel' && FK.jMonthKey(inv.date) === key) sum += invTotals(inv).grand; });
      sums.push(sum);
    }

    var recent = invs.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).slice(0, 6);

    el.innerHTML =
      '<div class="topbar"><div><div class="page-title display">داشبورد</div><div class="page-sub">نمای کلی کسب‌وکار شما</div></div>' +
      '<button class="btn btn-primary" id="dashNewBtn">' + svg('plus') + 'فاکتور جدید</button></div>' +
      '<div class="grid grid-4 stagger" style="margin-bottom:18px">' +
        stat('copper', 'مجموع فاکتورها', FK.Money.fmt(totalAll), FK.Money.unit(), FK.toFaDigits(invs.length) + ' فاکتور ثبت‌شده') +
        stat('brass', 'در انتظار وصول', FK.Money.fmt(totalPending), FK.Money.unit(), 'مطالبات پرداخت‌نشده') +
        stat('jade', 'این ماه', FK.Money.fmt(totalThisMonth), FK.Money.unit(), FK.toFaDigits(countThisMonth) + ' فاکتور') +
        stat('rust', 'مشتریان', FK.toFaDigits(DB.clients.length), 'نفر', 'ثبت‌شده در سامانه') +
      '</div>' +
      '<div class="grid grid-2">' +
        '<div class="card"><div class="card-head"><div class="card-title">روند درآمد ۶ ماه اخیر</div></div><div class="card-pad"><div class="chart-box"><canvas id="revChart"></canvas></div></div></div>' +
        '<div class="card"><div class="card-head"><div class="card-title">آخرین فاکتورها</div><button class="btn btn-ghost btn-sm" id="dashSeeAll">مشاهده همه</button></div>' +
        '<div class="table-wrap">' + (recent.length ? recentTable(recent) : emptyState('هنوز فاکتوری ثبت نشده')) + '</div></div>' +
      '</div>';

    document.getElementById('dashNewBtn').addEventListener('click', function () { go('new'); });
    var seeAll = document.getElementById('dashSeeAll');
    if (seeAll) seeAll.addEventListener('click', function () { go('invoices'); });
    bindRecentActions(el);

    if (window.Chart) {
      var ctx = document.getElementById('revChart').getContext('2d');
      if (revenueChart) revenueChart.destroy();
      var styles = getComputedStyle(document.documentElement);
      revenueChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: months, datasets: [{ data: sums, backgroundColor: styles.getPropertyValue('--copper').trim() || '#E4753C', borderRadius: 6, maxBarThickness: 34 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { rtl: true, callbacks: { label: function (c) { return FK.Money.full(c.parsed.y); } } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: styles.getPropertyValue('--txt-3').trim() } },
            y: { grid: { color: styles.getPropertyValue('--grid-line').trim() || 'rgba(128,128,128,.1)' }, ticks: { color: styles.getPropertyValue('--txt-3').trim(), callback: function (v) { return FK.toFaDigits(v); } } }
          }
        }
      });
    }
  }

  function stat(tone, label, value, unit, delta) {
    return '<div class="stat ' + tone + '"><div class="eyebrow">' + label + '</div><div class="value num">' + value + ' <small>' + unit + '</small></div><div class="delta">' + delta + '</div></div>';
  }

  function recentTable(list) {
    return '<table class="tbl"><thead><tr><th>شماره</th><th>مشتری</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead><tbody>' +
      list.map(function (inv) { return invoiceRow(inv); }).join('') + '</tbody></table>';
  }

  function statusBadge(status) {
    var s = FD.STATUSES[status] || FD.STATUSES.draft;
    return '<span class="badge ' + s.tone + '">' + s.label + '</span>';
  }

  function invoiceRow(inv) {
    var t = invTotals(inv);
    var client = clientName(inv);
    return '<tr>' +
      '<td class="mono num">' + FK.esc(inv.num) + '</td>' +
      '<td>' + FK.esc(client) + '</td>' +
      '<td class="num">' + FK.jFormat(inv.date, 'numeric') + '</td>' +
      '<td class="num tnum">' + FK.Money.fmt(t.grand) + '</td>' +
      '<td>' + statusBadge(inv.status) + '</td>' +
      '<td><div class="row-actions">' +
        iconBtn('view', inv.id, 'eye', 'مشاهده') +
        iconBtn('edit', inv.id, 'edit', 'ویرایش') +
      '</div></td></tr>';
  }
  function iconBtn(action, id, ico, title) {
    return '<button class="btn btn-ghost btn-icon" data-act="' + action + '" data-id="' + id + '" title="' + title + '">' + svg(ico) + '</button>';
  }
  function bindRecentActions(scope) {
    scope.querySelectorAll('[data-act="view"]').forEach(function (b) { b.addEventListener('click', function () { openPreview(+b.getAttribute('data-id')); }); });
    scope.querySelectorAll('[data-act="edit"]').forEach(function (b) { b.addEventListener('click', function () { editInvoice(+b.getAttribute('data-id')); }); });
  }

  function clientName(inv) {
    if (inv.clientSnapshot && inv.clientSnapshot.name) return inv.clientSnapshot.name;
    var c = DB.clients.find(function (x) { return x.id === inv.clientId; });
    return c ? c.name : 'بدون نام';
  }

  function emptyState(msg) {
    return '<div class="empty">' + svg('book') + '<div>' + msg + '</div></div>';
  }

  /* ------------------------------------------------------------------ *
   * Totals engine
   * ------------------------------------------------------------------ */
  function invTotals(inv) {
    var subtotal = (inv.items || []).reduce(function (s, it) { return s + FK.num(it.qty) * FK.num(it.price); }, 0);
    var discount = Math.min(FK.num(inv.discount), subtotal);
    var vatBase = subtotal - discount;
    var vat = vatBase * (FK.num(inv.vatRate) / 100);
    var grand = vatBase + vat;
    return { subtotal: subtotal, discount: discount, vat: vat, grand: grand };
  }

  /* ------------------------------------------------------------------ *
   * NEW / EDIT INVOICE
   * ------------------------------------------------------------------ */
  function blankInvoice() {
    return {
      id: null,
      num: '',
      clientId: null,
      clientSnapshot: null,
      trade: DB.profile.trade || 'paint',
      date: FK.todayIso(),
      items: [],
      discount: 0,
      vatRate: DB.profile.vatRate || 0,
      status: 'draft',
      paidAmount: 0,
      notes: '',
      createdAt: new Date().toISOString()
    };
  }

  function renderNew() {
    var inv = UI.invEdit || blankInvoice();
    UI.invEdit = inv;
    var el = document.getElementById('view-new');
    var isEdit = !!inv.id;

    el.innerHTML =
      '<div class="topbar"><div><div class="page-title display">' + (isEdit ? 'ویرایش فاکتور ' + FK.esc(inv.num) : 'فاکتور جدید') + '</div>' +
      '<div class="page-sub">اطلاعات را تکمیل کنید؛ قیمت‌ها به تومان ذخیره می‌شود</div></div></div>' +

      '<div class="grid grid-2" style="margin-bottom:16px">' +
        '<div class="card card-pad">' +
          '<div class="field" style="margin-bottom:12px"><label>مشتری</label>' +
            '<div class="flex gap-8"><select class="input" id="fClient"></select>' +
            '<button class="btn btn-ghost btn-icon" id="newClientBtn" title="مشتری جدید">' + svg('plus') + '</button></div></div>' +
          '<div class="field-row">' +
            '<div class="field"><label>تاریخ</label><input class="input mono" id="fDate" value="' + FK.jFormat(inv.date, 'numeric') + '" placeholder="۱۴۰۴/۰۱/۰۱" data-iso="' + inv.date + '"></div>' +
            '<div class="field"><label>وضعیت</label><select class="input" id="fStatus">' + Object.keys(FD.STATUSES).map(function (k) { return '<option value="' + k + '"' + (inv.status === k ? ' selected' : '') + '>' + FD.STATUSES[k].label + '</option>'; }).join('') + '</select></div>' +
          '</div>' +
        '</div>' +
        '<div class="card card-pad">' +
          '<div class="field"><label>یادداشت / توضیحات فاکتور</label><textarea class="input" id="fNotes" placeholder="مثلاً: آدرس محل کار، شماره واحد...">' + FK.esc(inv.notes || '') + '</textarea></div>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:16px">' +
        '<div class="card-head"><div class="card-title">اقلام فاکتور</div>' +
          '<div class="flex gap-8"><button class="btn btn-ghost btn-sm" id="pickFromCatalog">' + svg('book') + 'از قیمت‌نامه</button>' +
          '<button class="btn btn-primary btn-sm" id="addBlankItem">' + svg('plus') + 'قلم دستی</button></div></div>' +
        '<div class="card-pad" id="itemsBox"></div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-bottom:20px">' +
        '<div class="field-row">' +
          '<div class="field"><label>تخفیف (تومان)</label><input class="input num" id="fDiscount" inputmode="numeric" value="' + (inv.discount ? FK.grouped(inv.discount) : '') + '" placeholder="۰"></div>' +
          '<div class="field"><label>مالیات بر ارزش افزوده (٪)</label><input class="input num" id="fVat" inputmode="numeric" value="' + (inv.vatRate || '') + '" placeholder="۰"></div>' +
        '</div>' +
        '<div class="totals-box" id="totalsBox"></div>' +
      '</div>' +

      '<div class="flex gap-10 between" style="flex-wrap:wrap">' +
        '<button class="btn btn-ghost" id="cancelInvBtn">' + svg('x') + 'انصراف</button>' +
        '<div class="flex gap-10"><button class="btn" id="saveDraftBtn">ذخیره پیش‌نویس</button><button class="btn btn-primary" id="saveInvBtn">' + svg('check') + (isEdit ? 'ذخیره تغییرات' : 'ثبت فاکتور') + '</button></div>' +
      '</div>';

    fillClientSelect(inv.clientId);
    renderItems();
    renderTotals();

    document.getElementById('newClientBtn').addEventListener('click', function () { openClientModal(null, function (c) { fillClientSelect(c.id); }); });
    document.getElementById('fDate').addEventListener('change', function (e) {
      var iso = parseJalaliInput(e.target.value);
      if (iso) { inv.date = iso; e.target.setAttribute('data-iso', iso); e.target.value = FK.jFormat(iso, 'numeric'); }
      else { toast('تاریخ نامعتبر است — فرمت: ۱۴۰۴/۰۱/۰۱', 'rust'); e.target.value = FK.jFormat(inv.date, 'numeric'); }
    });
    document.getElementById('pickFromCatalog').addEventListener('click', openItemPicker);
    document.getElementById('addBlankItem').addEventListener('click', function () { inv.items.push({ name: '', unit: 'عدد', qty: 1, price: 0 }); renderItems(); renderTotals(); });
    document.getElementById('fDiscount').addEventListener('input', function (e) { inv.discount = FK.num(e.target.value); e.target.value = FK.grouped(inv.discount); renderTotals(); });
    document.getElementById('fVat').addEventListener('input', function (e) { inv.vatRate = FK.num(e.target.value); renderTotals(); });
    document.getElementById('cancelInvBtn').addEventListener('click', function () { confirmDialog('انصراف از فاکتور', 'تغییرات ذخیره‌نشده از بین می‌رود. ادامه می‌دهید؟', function () { UI.invEdit = null; go('dash'); }); });
    document.getElementById('saveDraftBtn').addEventListener('click', function () { saveInvoice(inv, 'draft'); });
    document.getElementById('saveInvBtn').addEventListener('click', function () { saveInvoice(inv, null); });

    function renderItems() {
      var box = document.getElementById('itemsBox');
      if (!inv.items.length) { box.innerHTML = emptyState('هیچ قلمی اضافه نشده — از «قیمت‌نامه» انتخاب کنید یا «قلم دستی» بزنید'); return; }
      box.innerHTML = inv.items.map(function (it, i) {
        return '<div class="li-row" data-i="' + i + '">' +
          '<input class="input li-name" placeholder="شرح خدمت" value="' + FK.esc(it.name) + '">' +
          '<input class="input li-unit" placeholder="واحد" value="' + FK.esc(it.unit || '') + '">' +
          '<input class="input li-qty num" inputmode="decimal" placeholder="تعداد" value="' + (it.qty || '') + '">' +
          '<input class="input li-price num" inputmode="numeric" placeholder="قیمت واحد" value="' + (it.price ? FK.grouped(it.price) : '') + '">' +
          '<button class="btn btn-ghost btn-icon" data-del="' + i + '" title="حذف">' + svg('trash') + '</button>' +
          '</div>';
      }).join('');
      box.querySelectorAll('.li-row').forEach(function (row) {
        var i = +row.getAttribute('data-i');
        row.querySelector('.li-name').addEventListener('input', function (e) { inv.items[i].name = e.target.value; });
        row.querySelector('.li-unit').addEventListener('input', function (e) { inv.items[i].unit = e.target.value; });
        row.querySelector('.li-qty').addEventListener('input', function (e) { inv.items[i].qty = FK.num(e.target.value); renderTotals(); });
        row.querySelector('.li-price').addEventListener('input', function (e) { inv.items[i].price = FK.num(e.target.value); e.target.value = FK.grouped(inv.items[i].price); renderTotals(); });
      });
      box.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () { inv.items.splice(+b.getAttribute('data-del'), 1); renderItems(); renderTotals(); });
      });
    }

    function renderTotals() {
      var t = invTotals(inv);
      document.getElementById('totalsBox').innerHTML =
        '<div class="totals-line"><span>جمع جزء</span><span class="num tnum">' + FK.Money.full(t.subtotal) + '</span></div>' +
        (t.discount ? '<div class="totals-line"><span>تخفیف</span><span class="num tnum">−' + FK.Money.full(t.discount) + '</span></div>' : '') +
        (t.vat ? '<div class="totals-line"><span>ارزش افزوده</span><span class="num tnum">' + FK.Money.full(t.vat) + '</span></div>' : '') +
        '<div class="totals-line grand"><span>مبلغ نهایی</span><span class="num tnum">' + FK.Money.full(t.grand) + '</span></div>';
    }

    function openItemPicker() {
      var list = DB.catalog[inv.trade] || [];
      var box = document.getElementById('pickerList');
      if (!list.length) { box.innerHTML = emptyState('قیمت‌نامه این صنف خالی است — از بخش «قیمت‌نامه» موارد اضافه کنید'); }
      else {
        box.innerHTML = '<div class="table-wrap"><table class="tbl"><thead><tr><th></th><th>شرح</th><th>واحد</th><th>قیمت</th></tr></thead><tbody>' +
          list.map(function (it, i) {
            return '<tr><td><input type="checkbox" class="pick-chk" data-i="' + i + '"></td><td>' + FK.esc(it.name) + '</td><td>' + FK.esc(it.unit) + '</td><td class="num tnum">' + FK.Money.fmt(it.price) + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }
      document.getElementById('pickerAddBtn').onclick = function () {
        box.querySelectorAll('.pick-chk:checked').forEach(function (c) {
          var it = list[+c.getAttribute('data-i')];
          inv.items.push({ name: it.name, unit: it.unit, qty: 1, price: it.price });
        });
        renderItems(); renderTotals();
        closeModal('pickerOverlay');
      };
      openModal('pickerOverlay');
    }
  }

  function fillClientSelect(selected) {
    var sel = document.getElementById('fClient');
    sel.innerHTML = '<option value="">— بدون مشتری —</option>' +
      DB.clients.map(function (c) { return '<option value="' + c.id + '"' + (c.id === selected ? ' selected' : '') + '>' + FK.esc(c.name) + (c.phone ? ' — ' + FK.esc(FK.toFaDigits(c.phone)) : '') + '</option>'; }).join('');
  }

  function parseJalaliInput(v) {
    var m = /^(\d{3,4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.exec(FK.toEnDigits(v).trim());
    if (!m) return null;
    var jy = +m[1], jm = +m[2], jd = +m[3];
    if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
    try { return FK.jToIso(jy, jm, jd); } catch (e) { return null; }
  }

  function saveInvoice(inv, forceStatus) {
    var sel = document.getElementById('fClient');
    inv.clientId = sel.value ? +sel.value : null;
    var c = DB.clients.find(function (x) { return x.id === inv.clientId; });
    inv.clientSnapshot = c ? { name: c.name, phone: c.phone, address: c.address } : null;
    inv.notes = document.getElementById('fNotes').value;
    var fStatus = document.getElementById('fStatus');
    inv.status = forceStatus || (fStatus ? fStatus.value : inv.status) || 'pending';
    if (!inv.id && !forceStatus && inv.status === 'draft') inv.status = 'pending';

    if (!inv.items.length) { toast('حداقل یک قلم اضافه کنید', 'rust'); return; }
    for (var i = 0; i < inv.items.length; i++) {
      if (!inv.items[i].name || !inv.items[i].name.trim()) { toast('شرح همه اقلام را وارد کنید', 'rust'); return; }
    }

    if (!inv.id) {
      inv.id = DB.seq++;
      inv.num = DB.profile.prefix + '-' + FK.toFaDigits(DB.profile.nextNum);
      DB.profile.nextNum++;
      DB.invoices.push(inv);
    } else {
      var idx = DB.invoices.findIndex(function (x) { return x.id === inv.id; });
      if (idx >= 0) DB.invoices[idx] = inv;
    }
    persist();
    toast('فاکتور ذخیره شد', 'jade');
    UI.invEdit = null;
    go('invoices');
  }

  function editInvoice(id) {
    var inv = DB.invoices.find(function (x) { return x.id === id; });
    if (!inv) return;
    UI.invEdit = FK.clone(inv);
    go('new', { keepDraft: true });
  }

  /* ------------------------------------------------------------------ *
   * INVOICES LIST
   * ------------------------------------------------------------------ */
  function renderInvoices() {
    var el = document.getElementById('view-invoices');
    el.innerHTML =
      '<div class="topbar"><div><div class="page-title display">فاکتورها</div><div class="page-sub">' + FK.toFaDigits(DB.invoices.length) + ' فاکتور</div></div>' +
      '<button class="btn btn-primary" id="invNewBtn">' + svg('plus') + 'فاکتور جدید</button></div>' +
      '<div class="card">' +
        '<div class="card-head">' +
          '<div class="search-box grow">' + svg('search') + '<input class="input" id="invSearch" placeholder="جستجوی شماره فاکتور یا نام مشتری..." value="' + FK.esc(UI.invSearch) + '"></div>' +
          '<select class="input" id="invStatusFilter" style="max-width:180px">' +
            '<option value="all">همه وضعیت‌ها</option>' +
            Object.keys(FD.STATUSES).map(function (k) { return '<option value="' + k + '"' + (UI.invFilterStatus === k ? ' selected' : '') + '>' + FD.STATUSES[k].label + '</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<div class="table-wrap" id="invTableWrap"></div>' +
      '</div>';
    document.getElementById('invNewBtn').addEventListener('click', function () { go('new'); });
    document.getElementById('invSearch').addEventListener('input', function (e) { UI.invSearch = e.target.value; renderInvTable(); });
    document.getElementById('invStatusFilter').addEventListener('change', function (e) { UI.invFilterStatus = e.target.value; renderInvTable(); });
    renderInvTable();
  }

  function renderInvTable() {
    var q = FK.normalize(UI.invSearch);
    var list = DB.invoices.filter(function (inv) {
      if (UI.invFilterStatus !== 'all' && inv.status !== UI.invFilterStatus) return false;
      if (!q) return true;
      var hay = FK.normalize((inv.num || '') + ' ' + clientName(inv));
      return hay.indexOf(q) !== -1;
    }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });

    var wrap = document.getElementById('invTableWrap');
    if (!list.length) { wrap.innerHTML = emptyState('فاکتوری یافت نشد'); return; }
    wrap.innerHTML = '<table class="tbl"><thead><tr><th>شماره</th><th>مشتری</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead><tbody>' +
      list.map(function (inv) {
        var t = invTotals(inv);
        return '<tr>' +
          '<td class="mono num">' + FK.esc(inv.num) + '</td>' +
          '<td>' + FK.esc(clientName(inv)) + '</td>' +
          '<td class="num">' + FK.jFormat(inv.date, 'numeric') + '</td>' +
          '<td class="num tnum">' + FK.Money.fmt(t.grand) + '</td>' +
          '<td>' + statusBadge(inv.status) + '</td>' +
          '<td><div class="row-actions">' +
            iconBtn('view', inv.id, 'eye', 'مشاهده') +
            iconBtn('edit', inv.id, 'edit', 'ویرایش') +
            iconBtn('dup', inv.id, 'dup', 'کپی') +
            iconBtn('del', inv.id, 'trash', 'حذف') +
          '</div></td></tr>';
      }).join('') + '</tbody></table>';

    wrap.querySelectorAll('[data-act="view"]').forEach(function (b) { b.addEventListener('click', function () { openPreview(+b.getAttribute('data-id')); }); });
    wrap.querySelectorAll('[data-act="edit"]').forEach(function (b) { b.addEventListener('click', function () { editInvoice(+b.getAttribute('data-id')); }); });
    wrap.querySelectorAll('[data-act="dup"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var src = DB.invoices.find(function (x) { return x.id === +b.getAttribute('data-id'); });
        if (!src) return;
        var copy = FK.clone(src);
        copy.id = DB.seq++;
        copy.num = DB.profile.prefix + '-' + FK.toFaDigits(DB.profile.nextNum);
        DB.profile.nextNum++;
        copy.status = 'draft'; copy.paidAmount = 0; copy.date = FK.todayIso(); copy.createdAt = new Date().toISOString();
        DB.invoices.push(copy);
        persist(); toast('فاکتور کپی شد', 'jade'); renderInvTable(); renderNav();
      });
    });
    wrap.querySelectorAll('[data-act="del"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = +b.getAttribute('data-id');
        confirmDialog('حذف فاکتور', 'این فاکتور برای همیشه حذف می‌شود.', function () {
          DB.invoices = DB.invoices.filter(function (x) { return x.id !== id; });
          persist(); toast('فاکتور حذف شد'); renderInvTable(); renderNav();
        });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * PREVIEW / PRINT / PDF
   * ------------------------------------------------------------------ */
  function openPreview(id) {
    var inv = DB.invoices.find(function (x) { return x.id === id; });
    if (!inv) return;
    var t = invTotals(inv);
    var p = DB.profile;
    var client = inv.clientSnapshot || DB.clients.find(function (x) { return x.id === inv.clientId; }) || {};

    document.getElementById('printArea').innerHTML =
      '<div class="paper" id="paperNode"><div class="paper-pad">' +
        '<div class="paper-top">' +
          '<div class="paper-logo">' + (p.logo ? '<img src="' + p.logo + '">' : '') +
            '<div><div class="paper-biz">' + FK.esc(p.businessName || 'کسب‌وکار من') + '</div>' +
            '<div style="font-size:11.5px;color:#555">' + FK.esc(p.owner || '') + (p.phone ? ' · ' + FK.esc(FK.toFaDigits(p.phone)) : '') + '</div></div></div>' +
          '<div style="text-align:end">' +
            '<div style="font-family:var(--f-display);font-size:20px">فاکتور</div>' +
            '<div class="mono" style="font-size:12px;color:#555">شماره: ' + FK.esc(inv.num) + '</div>' +
            '<div class="mono" style="font-size:12px;color:#555">تاریخ: ' + FK.jFormat(inv.date, 'numeric') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="flex between" style="gap:20px;flex-wrap:wrap">' +
          '<div><div style="font-size:11px;color:#888;margin-bottom:3px">مشتری</div><div style="font-weight:700">' + FK.esc(client.name || '—') + '</div>' +
          (client.phone ? '<div style="font-size:12px;color:#555">' + FK.esc(FK.toFaDigits(client.phone)) + '</div>' : '') +
          (client.address ? '<div style="font-size:12px;color:#555">' + FK.esc(client.address) + '</div>' : '') + '</div>' +
        '</div>' +
        '<table><thead><tr><th>شرح</th><th>تعداد</th><th>واحد</th><th>قیمت واحد</th><th>جمع</th></tr></thead><tbody>' +
          inv.items.map(function (it) {
            return '<tr><td>' + FK.esc(it.name) + '</td><td class="num">' + FK.toFaDigits(it.qty) + '</td><td>' + FK.esc(it.unit || '') + '</td><td class="num">' + FK.Money.fmt(it.price) + '</td><td class="num">' + FK.Money.fmt(it.qty * it.price) + '</td></tr>';
          }).join('') +
        '</tbody></table>' +
        '<div class="p-totals">' +
          '<div><span>جمع جزء</span><span class="num">' + FK.Money.full(t.subtotal) + '</span></div>' +
          (t.discount ? '<div><span>تخفیف</span><span class="num">−' + FK.Money.full(t.discount) + '</span></div>' : '') +
          (t.vat ? '<div><span>ارزش افزوده</span><span class="num">' + FK.Money.full(t.vat) + '</span></div>' : '') +
          '<div class="grand"><span>مبلغ نهایی</span><span class="num">' + FK.Money.full(t.grand) + '</span></div>' +
        '</div>' +
        '<div class="p-words">مبلغ به حروف: ' + FK.words(t.grand) + ' ' + FK.Money.unit() + '</div>' +
        (inv.notes ? '<div class="p-words">توضیحات: ' + FK.esc(inv.notes) + '</div>' : '') +
        (p.terms ? '<div class="p-words">شرایط: ' + FK.esc(p.terms) + '</div>' : '') +
        '<div class="p-foot"><span>' + FK.esc(p.address || '') + '</span><span>' + statusLabelFa(inv.status) + '</span></div>' +
      '</div></div>';

    document.getElementById('previewTitle').textContent = 'فاکتور ' + inv.num;
    document.getElementById('pdfBtn').onclick = function () { exportPdf(inv.num); };
    document.getElementById('printBtn').onclick = function () { window.print(); };
    openModal('previewOverlay');
  }

  function statusLabelFa(s) { return (FD.STATUSES[s] || FD.STATUSES.draft).label; }

  function exportPdf(filename) {
    if (!window.html2canvas || !window.jspdf) { toast('کتابخانه PDF بارگذاری نشد', 'rust'); return; }
    var node = document.getElementById('paperNode');
    toast('در حال ساخت PDF...');
    html2canvas(node, { scale: 2, backgroundColor: '#ffffff' }).then(function (canvas) {
      var img = canvas.toDataURL('image/jpeg', 0.95);
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(img, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save((filename || 'invoice') + '.pdf');
    }).catch(function () { toast('خطا در ساخت PDF', 'rust'); });
  }

  /* ------------------------------------------------------------------ *
   * CLIENTS
   * ------------------------------------------------------------------ */
  function renderClients() {
    var el = document.getElementById('view-clients');
    el.innerHTML =
      '<div class="topbar"><div><div class="page-title display">مشتریان</div><div class="page-sub">' + FK.toFaDigits(DB.clients.length) + ' مشتری</div></div>' +
      '<button class="btn btn-primary" id="clNewBtn">' + svg('plus') + 'مشتری جدید</button></div>' +
      '<div class="card"><div class="card-head"><div class="search-box grow">' + svg('search') + '<input class="input" id="clSearch" placeholder="جستجوی نام یا شماره تماس..." value="' + FK.esc(UI.clientSearch) + '"></div></div>' +
      '<div class="table-wrap" id="clTableWrap"></div></div>';
    document.getElementById('clNewBtn').addEventListener('click', function () { openClientModal(null, function () { renderClTable(); renderNav(); }); });
    document.getElementById('clSearch').addEventListener('input', function (e) { UI.clientSearch = e.target.value; renderClTable(); });
    renderClTable();
  }

  function renderClTable() {
    var q = FK.normalize(UI.clientSearch);
    var list = DB.clients.filter(function (c) { return !q || FK.normalize(c.name + ' ' + (c.phone || '')).indexOf(q) !== -1; });
    var wrap = document.getElementById('clTableWrap');
    if (!list.length) { wrap.innerHTML = emptyState('مشتری‌ای یافت نشد'); return; }
    wrap.innerHTML = '<table class="tbl"><thead><tr><th>نام</th><th>تماس</th><th>آدرس</th><th>تعداد فاکتور</th><th></th></tr></thead><tbody>' +
      list.map(function (c) {
        var n = DB.invoices.filter(function (i) { return i.clientId === c.id; }).length;
        return '<tr><td style="font-weight:700">' + FK.esc(c.name) + '</td><td class="num">' + (c.phone ? FK.esc(FK.toFaDigits(c.phone)) : '—') + '</td>' +
          '<td class="dim">' + FK.esc(c.address || '—') + '</td><td class="num">' + FK.toFaDigits(n) + '</td>' +
          '<td><div class="row-actions">' + iconBtn('edit', c.id, 'edit', 'ویرایش') + iconBtn('del', c.id, 'trash', 'حذف') + '</div></td></tr>';
      }).join('') + '</tbody></table>';
    wrap.querySelectorAll('[data-act="edit"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = DB.clients.find(function (x) { return x.id === +b.getAttribute('data-id'); });
        openClientModal(c, function () { renderClTable(); });
      });
    });
    wrap.querySelectorAll('[data-act="del"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = +b.getAttribute('data-id');
        confirmDialog('حذف مشتری', 'مشتری حذف می‌شود؛ فاکتورهای قبلی او دست‌نخورده باقی می‌مانند.', function () {
          DB.clients = DB.clients.filter(function (x) { return x.id !== id; });
          persist(); toast('مشتری حذف شد'); renderClTable(); renderNav();
        });
      });
    });
  }

  function openClientModal(client, onSaved) {
    var isEdit = !!client;
    document.getElementById('clientModalTitle').textContent = isEdit ? 'ویرایش مشتری' : 'مشتری جدید';
    document.getElementById('cName').value = client ? client.name : '';
    document.getElementById('cPhone').value = client ? (client.phone || '') : '';
    document.getElementById('cAddress').value = client ? (client.address || '') : '';
    document.getElementById('cNote').value = client ? (client.note || '') : '';
    var saveBtn = document.getElementById('clientSaveBtn');
    var clone = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(clone, saveBtn);
    clone.addEventListener('click', function () {
      var name = document.getElementById('cName').value.trim();
      if (!name) { toast('نام مشتری را وارد کنید', 'rust'); return; }
      var rec = client || { id: DB.seq++ };
      rec.name = name;
      rec.phone = document.getElementById('cPhone').value.trim();
      rec.address = document.getElementById('cAddress').value.trim();
      rec.note = document.getElementById('cNote').value.trim();
      if (!client) DB.clients.push(rec);
      persist();
      closeModal('clientOverlay');
      toast('مشتری ذخیره شد', 'jade');
      if (onSaved) onSaved(rec);
    });
    openModal('clientOverlay');
  }

  /* ------------------------------------------------------------------ *
   * CATALOG (price list per trade)
   * ------------------------------------------------------------------ */
  function renderCatalog() {
    var el = document.getElementById('view-catalog');
    el.innerHTML =
      '<div class="topbar"><div><div class="page-title display">قیمت‌نامه</div><div class="page-sub">لیست خدمات و قیمت‌های نقاشی</div></div>' +
      '<button class="btn btn-primary" id="catAddBtn">' + svg('plus') + 'افزودن قلم</button></div>' +
      '<div class="card"><div class="table-wrap" id="catTableWrap"></div></div>';

    document.getElementById('catAddBtn').addEventListener('click', function () { openCatalogItemModal(null); });
    renderCatTable();
  }

  function renderCatTable() {
    var list = DB.catalog[UI.catalogTrade] || [];
    var wrap = document.getElementById('catTableWrap');
    if (!list.length) { wrap.innerHTML = emptyState('برای این صنف هنوز موردی ثبت نشده'); return; }
    wrap.innerHTML = '<table class="tbl"><thead><tr><th>شرح خدمت</th><th>واحد</th><th>قیمت</th><th></th></tr></thead><tbody>' +
      list.map(function (it, i) {
        return '<tr><td>' + FK.esc(it.name) + '</td><td class="dim">' + FK.esc(it.unit) + '</td><td class="num tnum">' + FK.Money.full(it.price) + '</td>' +
          '<td><div class="row-actions">' + iconBtn('edit', i, 'edit', 'ویرایش') + iconBtn('del', i, 'trash', 'حذف') + '</div></td></tr>';
      }).join('') + '</tbody></table>';
    wrap.querySelectorAll('[data-act="edit"]').forEach(function (b) { b.addEventListener('click', function () { openCatalogItemModal(+b.getAttribute('data-id')); }); });
    wrap.querySelectorAll('[data-act="del"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.getAttribute('data-id');
        confirmDialog('حذف قلم', 'این مورد از قیمت‌نامه حذف می‌شود.', function () {
          DB.catalog[UI.catalogTrade].splice(i, 1); persist(); renderCatTable(); toast('حذف شد');
        });
      });
    });
  }

  function openCatalogItemModal(index) {
    var item = (typeof index === 'number' && !isNaN(index) && index >= 0) ? DB.catalog[UI.catalogTrade][index] : null;
    document.getElementById('catModalTitle').textContent = item ? 'ویرایش قلم' : 'قلم جدید';
    document.getElementById('kName').value = item ? item.name : '';
    document.getElementById('kUnit').value = item ? item.unit : 'متر مربع';
    document.getElementById('kPrice').value = item ? FK.grouped(item.price) : '';
    var saveBtn = document.getElementById('catSaveBtn');
    var clone = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(clone, saveBtn);
    clone.addEventListener('click', function () {
      var name = document.getElementById('kName').value.trim();
      if (!name) { toast('شرح خدمت را وارد کنید', 'rust'); return; }
      var rec = { name: name, unit: document.getElementById('kUnit').value.trim() || 'عدد', price: FK.num(document.getElementById('kPrice').value) };
      if (!DB.catalog[UI.catalogTrade]) DB.catalog[UI.catalogTrade] = [];
      if (item) DB.catalog[UI.catalogTrade][index] = rec; else DB.catalog[UI.catalogTrade].push(rec);
      persist(); closeModal('catalogOverlay'); toast('ذخیره شد', 'jade'); renderCatTable();
    });
    openModal('catalogOverlay');
  }

  /* ------------------------------------------------------------------ *
   * SETTINGS
   * ------------------------------------------------------------------ */
  function renderSettings() {
    var p = DB.profile;
    var el = document.getElementById('view-settings');
    el.innerHTML =
      '<div class="topbar"><div><div class="page-title display">تنظیمات</div><div class="page-sub">اطلاعات کسب‌وکار و پیکربندی سامانه</div></div></div>' +
      '<div class="grid grid-2">' +
        '<div class="card card-pad">' +
          '<div class="card-title" style="margin-bottom:14px">اطلاعات کسب‌وکار</div>' +
          '<div class="field" style="margin-bottom:12px"><label>نام کسب‌وکار</label><input class="input" id="sBiz" value="' + FK.esc(p.businessName) + '"></div>' +
          '<div class="field-row" style="margin-bottom:12px">' +
            '<div class="field"><label>نام مالک</label><input class="input" id="sOwner" value="' + FK.esc(p.owner) + '"></div>' +
            '<div class="field"><label>شماره تماس</label><input class="input mono" id="sPhone" value="' + FK.esc(p.phone) + '"></div>' +
          '</div>' +
          '<div class="field" style="margin-bottom:12px"><label>آدرس</label><textarea class="input" id="sAddress">' + FK.esc(p.address) + '</textarea></div>' +
          '<div class="field" style="margin-bottom:12px"><label>شناسه/کد اقتصادی (اختیاری)</label><input class="input mono" id="sNid" value="' + FK.esc(p.nationalId) + '"></div>' +
          '<div class="field"><label>لوگو</label><div class="flex gap-10 center">' +
            (p.logo ? '<img src="' + p.logo + '" style="width:52px;height:52px;border-radius:10px;object-fit:cover">' : '') +
            '<button class="btn btn-sm" id="sLogoBtn">' + svg('upload') + 'بارگذاری لوگو</button>' +
            (p.logo ? '<button class="btn btn-ghost btn-sm" id="sLogoRemove">حذف</button>' : '') +
            '<input type="file" id="sLogoFile" accept="image/*" class="hidden">' +
          '</div></div>' +
        '</div>' +
        '<div class="card card-pad">' +
          '<div class="card-title" style="margin-bottom:14px">پیکربندی فاکتور</div>' +
          '<div class="field-row" style="margin-bottom:12px">' +
            '<div class="field"><label>پیشوند شماره فاکتور</label><input class="input mono" id="sPrefix" value="' + FK.esc(p.prefix) + '"></div>' +
            '<div class="field"><label>شماره بعدی</label><input class="input mono num" id="sNextNum" value="' + FK.toFaDigits(p.nextNum) + '"></div>' +
          '</div>' +
          '<div class="field-row" style="margin-bottom:12px">' +
            '<div class="field"><label>واحد پول</label><select class="input" id="sCurrency"><option value="toman"' + (p.currency === 'toman' ? ' selected' : '') + '>تومان</option><option value="rial"' + (p.currency === 'rial' ? ' selected' : '') + '>ریال</option></select></div>' +
            '<div class="field"><label>مالیات پیش‌فرض (٪)</label><input class="input num" id="sVat" value="' + (p.vatRate || '') + '"></div>' +
          '</div>' +
          '<div class="field" style="margin-bottom:12px"><label>شرایط و ضمانت پیش‌فرض</label><textarea class="input" id="sTerms">' + FK.esc(p.terms) + '</textarea></div>' +
          '<button class="btn btn-primary" id="sSaveBtn">' + svg('check') + 'ذخیره تنظیمات</button>' +
        '</div>' +
      '</div>' +
      '<div class="card card-pad" style="margin-top:16px">' +
        '<div class="card-title" style="margin-bottom:14px">پشتیبان‌گیری و بازیابی</div>' +
        '<div class="flex gap-10" style="flex-wrap:wrap">' +
          '<button class="btn" id="sExport">' + svg('download') + 'دانلود پشتیبان (JSON)</button>' +
          '<button class="btn" id="sImportBtn">' + svg('upload') + 'بازیابی از فایل</button>' +
          '<input type="file" id="sImportFile" accept="application/json" class="hidden">' +
          '<button class="btn btn-danger" id="sReset">' + svg('trash') + 'پاک‌سازی کامل داده‌ها</button>' +
        '</div>' +
        '<div class="hint" style="margin-top:10px">داده‌ها فقط در همین مرورگر ذخیره می‌شوند. برای انتقال به دستگاه دیگر، از پشتیبان استفاده کنید.</div>' +
      '</div>';

    document.getElementById('sLogoBtn').addEventListener('click', function () { document.getElementById('sLogoFile').click(); });
    document.getElementById('sLogoFile').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      FK.downscaleImage(f, 240, function (err, dataUrl) {
        if (err) { toast(err.message, 'rust'); return; }
        p.logo = dataUrl; persist(); renderSettings(); toast('لوگو ذخیره شد', 'jade');
      });
    });
    var logoRemove = document.getElementById('sLogoRemove');
    if (logoRemove) logoRemove.addEventListener('click', function () { p.logo = ''; persist(); renderSettings(); });

    document.getElementById('sSaveBtn').addEventListener('click', function () {
      p.businessName = document.getElementById('sBiz').value.trim();
      p.owner = document.getElementById('sOwner').value.trim();
      p.phone = document.getElementById('sPhone').value.trim();
      p.address = document.getElementById('sAddress').value.trim();
      p.nationalId = document.getElementById('sNid').value.trim();
      p.prefix = document.getElementById('sPrefix').value.trim() || 'FK';
      p.nextNum = Math.max(1, Math.round(FK.num(document.getElementById('sNextNum').value)) || p.nextNum);
      p.currency = document.getElementById('sCurrency').value;
      p.vatRate = FK.num(document.getElementById('sVat').value);
      p.terms = document.getElementById('sTerms').value;
      persist(); toast('تنظیمات ذخیره شد', 'jade');
    });

    document.getElementById('sExport').addEventListener('click', function () {
      var blob = FK.Store.exportBlob(DB);
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'faktoryar-backup-' + FK.todayIso() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
    });
    document.getElementById('sImportBtn').addEventListener('click', function () { document.getElementById('sImportFile').click(); });
    document.getElementById('sImportFile').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          DB = FK.Store.importText(reader.result);
          persist();
          toast('بازیابی با موفقیت انجام شد', 'jade');
          go('dash');
        } catch (err) { toast('فایل پشتیبان نامعتبر است', 'rust'); }
      };
      reader.readAsText(f);
    });
    document.getElementById('sReset').addEventListener('click', function () {
      confirmDialog('پاک‌سازی کامل', 'همه فاکتورها، مشتریان و تنظیمات برای همیشه حذف می‌شود. این کار غیرقابل بازگشت است.', function () {
        DB = FK.Store.reset();
        toast('داده‌ها پاک شد');
        go('dash');
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Router table + boot
   * ------------------------------------------------------------------ */
  var RENDER = { dash: renderDash, new: renderNew, invoices: renderInvoices, clients: renderClients, catalog: renderCatalog, settings: renderSettings };

  renderNav();
  go('dash');
})();
