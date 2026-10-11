/* 租赁网站 前端演示版：纯静态 SPA，hash 路由，数据来自 js/data.js，询价单存 localStorage */
(function () {
  /* 数据来源：有本地服务器时读 /api/bootstrap（后台发布的内容）；双击打开（file://）或接口失败时用 js/data.js 兜底 */
  var PREVIEW = /[?&]preview=1/.test(location.search);
  window.PAGES = window.PAGES || {};
  function T(path, def) { // 读后台「页面管理」已发布（预览时为草稿）的文案，拿不到就用默认值
    var v = path.split('.').reduce(function (o, k) { return o && o[k] != null ? o[k] : undefined; }, window.PAGES);
    return (v === undefined || v === '' || (Array.isArray(v) && !v.length)) ? def : v;
  }
  function boot() {
    if (location.protocol.indexOf('http') !== 0) return start(false);
    fetch('/api/bootstrap' + (PREVIEW ? '?preview=1' : ''), { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (b) { var fb = window.DATA || {}; b.demoAccount = fb.demoAccount; b.salesDefault = b.salesDefault || fb.salesDefault; b.salesContacts = b.salesContacts || fb.salesContacts; b.hotKeywords = b.hotKeywords || fb.hotKeywords; b.posterSlogan = b.posterSlogan || fb.posterSlogan; window.DATA = b; window.PAGES = b.pages || {}; start(true); })
      .catch(function () { start(false); });
  }
  boot();
  function start(ONLINE) {
  var D = window.DATA, S = D.site, $app = document.getElementById('app');
  var MODES = {
    long: { title: '长期租用', bar: '按月计费，含印量，超出按张计费', icon: '📅' },
    short: { title: '短期租用', bar: '1 天起租，按天计费', icon: '⏱️' },
    expo: { title: '展会快速租用', bar: '展会专享，送装到展馆，撤展回收', icon: '🎪' }
  };
  ['long', 'short', 'expo'].forEach(function (m) {
    MODES[m].title = T('list_' + m + '.head.title', MODES[m].title); MODES[m].bar = T('list_' + m + '.head.bar', MODES[m].bar); MODES[m].empty = T('list_' + m + '.head.empty', '没有合适的套餐？');
  });
  var TIER = { basic: '普通', allin: '全包', premium: '豪华' };
  var QKEY = 'rental_demo_quote_v1', PKEY = 'rental_demo_profile_v1', LKEY = 'rental_demo_login_v1', MYKEY = 'rental_demo_myorders_v1';
  var SKEY = 'rental_demo_scene_v1', SUBKEY = 'rental_demo_sub_v1', FKEY = 'rental_demo_fav_v1', RKEY = 'rental_demo_recent_v1', HKEY = 'rental_demo_search_v1', DELKEY = 'rental_demo_deleted_v1', QAKEY = 'rental_demo_qaction_v1';
  function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  /* E2/E3 扫码进入：模拟小程序启动参数 scene（s_客服ID = 专属码，c_渠道ID = 渠道码）。存本机 30 天，以最后一次扫码为准 */
  var SCENE_DAYS = 30;
  function readScene() {
    var m = location.search.match(/[?&]scene=([^&#]+)/); if (!m) return;
    var sc = decodeURIComponent(m[1]), st = lsGet(SKEY, {}), k = /^s_/.test(sc) ? 'ref' : /^c_/.test(sc) ? 'channel' : '';
    if (!k) return;
    if (sessionStorage.getItem('rental_demo_scene_seen') === sc) return; // 同一次打开只记一次
    sessionStorage.setItem('rental_demo_scene_seen', sc);
    st[k] = { id: sc.slice(2), at: Date.now() }; lsSet(SKEY, st);
    if (ONLINE) fetch('/api/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scene: sc }) }).catch(function () {});
  }
  function sceneVal(k) { var x = lsGet(SKEY, {})[k]; return x && Date.now() - x.at < SCENE_DAYS * 864e5 ? x.id : ''; }
  readScene();

  /* ---------- 工具 ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function yen(n) { return '¥' + Number(n).toLocaleString('zh-CN'); }
  function plans(mode) { return D.plans.filter(function (p) { return p.mode === mode && p.published !== false; }); }
  function planById(id) { return D.plans.filter(function (p) { return p.id === id; })[0]; }
  function priceHTML(p) {
    var r = p.pricing;
    if (p.mode === 'long') return r.monthlyFee ? yen(r.monthlyFee) + '<small>/月</small>' : '需商务报价';
    if (p.mode === 'short') return r.dailyFee ? yen(r.dailyFee) + '<small>/天</small>' : '需商务报价';
    return r.dailyFee ? '<small>一天套餐 </small>' + yen(r.dailyFee) : '需商务报价';
  }
  function minPrice(mode) {
    var k = mode === 'long' ? 'monthlyFee' : 'dailyFee';
    return Math.min.apply(null, plans(mode).map(function (p) { return p.pricing[k] || 1e9; }).concat([1e9]));
  }
  var PAL = { basic: ['#DBEAFE', '#1E40AF'], allin: ['#DCFCE7', '#15803D'], premium: ['#FEF3C7', '#B45309'] };
  function img(p) { // 有素材图用素材图，否则用占位图（SVG，非真实产品图）
    if (p.images && p.images[0]) return '<img src="' + esc(p.images[0]) + '" alt="" style="width:100%;height:100%;object-fit:cover">';
    var c = PAL[p.tier] || PAL.basic, color = p.devices[0] && p.devices[0].color;
    return '<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="120" height="120" fill="' + c[0] + '"/>' +
      '<rect x="28" y="40" width="64" height="38" rx="5" fill="' + c[1] + '"/><rect x="36" y="28" width="48" height="14" rx="2" fill="#fff" stroke="' + c[1] + '" stroke-width="2"/>' +
      '<rect x="36" y="70" width="48" height="22" fill="#fff" stroke="' + c[1] + '" stroke-width="2"/>' +
      (color ? '<circle cx="82" cy="50" r="3" fill="#F97316"/><circle cx="74" cy="50" r="3" fill="#22C55E"/><circle cx="66" cy="50" r="3" fill="#3B82F6"/>' : '<circle cx="82" cy="50" r="3" fill="#fff"/>') +
      '<line x1="42" y1="78" x2="78" y2="78" stroke="#CBD5E1" stroke-width="2"/><line x1="42" y1="84" x2="70" y2="84" stroke="#CBD5E1" stroke-width="2"/>' +
      '<text x="60" y="110" font-size="9" text-anchor="middle" fill="' + c[1] + '">示意图</text></svg>';
  }
  function toast(t) { var el = document.getElementById('toast'); el.textContent = t; el.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(function () { el.style.display = 'none'; }, 1600); }
  function today(off) { var d = new Date(); d.setDate(d.getDate() + (off || 0)); return d.toISOString().slice(0, 10); }

  /* ---------- 询价单存储（localStorage，刷新不丢，保留 30 天） ---------- */
  function loadQ() { try { var o = JSON.parse(localStorage.getItem(QKEY) || 'null'); if (o && Date.now() - o.t < 30 * 864e5) return o.items; } catch (e) {} return []; }
  function saveQ(items) { localStorage.setItem(QKEY, JSON.stringify({ t: Date.now(), items: items })); }
  function qCount() { return loadQ().length; }

  /* ---------- 预算计算（纯函数） ---------- */
  function unitPrice(p, item) { // 租期阶梯价 / 天数阶梯价（和服务器 unit_price 同一规则）
    var r = p.pricing;
    if (p.mode === 'long') { var t = (r.termPrices || []).filter(function (x) { return +x.months === +item.months; })[0]; return t ? t.monthlyFee : r.monthlyFee; }
    var fee = r.dailyFee;
    (r.dayTiers || []).slice().sort(function (a, b) { return a.minDays - b.minDays; }).forEach(function (t) { if (item.days >= t.minDays) fee = t.dailyFee; });
    return fee;
  }
  function budget(item) {
    var p = planById(item.planId), r = p.pricing, base, up = unitPrice(p, item);
    if (!up) return null;
    if (p.mode === 'long') base = up * item.months * item.qty;
    else { base = up * item.days * item.qty; if (p.mode === 'expo') base += (r.fixedFee || 0); }
    var rt = S.roundTo || 10, min = Math.round(base / rt) * rt, max = Math.round(base * (1 + S.budgetBufferRate) / rt) * rt;
    return { min: min, max: max };
  }
  function formula(item) {
    var p = planById(item.planId), r = p.pricing;
    if (p.mode === 'long') return yen(unitPrice(p, item)) + '/月 × ' + item.months + ' 个月 × ' + item.qty + ' 台';
    var s = yen(unitPrice(p, item)) + '/天 × ' + item.days + ' 天 × ' + item.qty + ' 台';
    if (p.mode === 'expo') s += ' + 送装费 ' + yen(r.fixedFee || 0);
    return s;
  }
  function itemMeta(it) {
    if (it.mode === 'long') return '租期 ' + it.months + ' 个月 · ' + it.qty + ' 台';
    if (it.mode === 'short') return (it.startDate ? it.startDate + ' 起 · ' : '') + it.days + ' 天 · ' + it.qty + ' 台';
    var e = it.expo || {};
    return (e.name ? e.name + ' · ' : '') + (it.startDate || '') + ' 起 ' + it.days + ' 天 · ' + it.qty + ' 台' + (e.venue ? ' · ' + e.venue : '');
  }
  window.__budget = budget; // 供自测调用

  /* ---------- 公共外壳 ---------- */
  function nav(title, back) {
    var n = qCount();
    return '<div class="nav">' + (back ? '<button class="back" onclick="history.length>1?history.back():location.hash=\'#/mall\'" aria-label="返回">‹</button>' : '') +
      esc(title) + '<a class="qbadge" href="#/quote" aria-label="询价单">' + ico('quote') + (n ? '<span class="dot qcount">' + n + '</span>' : '') + '</a></div>';
  }
  function tabbar(on) {
    var n = qCount();
    function t(k, h, ic, tx) { return '<a href="' + h + '" class="' + (on === k ? 'on' : '') + '"><span class="ic">' + ic + '</span>' + tx + (k === 'quote' && n ? '<span class="dot">' + n + '</span>' : '') + '</a>'; }
    return '<nav class="tabbar">' + t('home', '#/', ico('home'), T('global.tab.home', '首页')) + t('mall', '#/mall', ico('mall'), T('global.tab.mall', '商城')) + t('quote', '#/quote', ico('quote'), T('global.tab.quote', '询价单')) + t('mine', '#/mine', ico('mine'), T('global.tab.mine', '我的')) + '</nav>';
  }
  function render(html, opts) {
    opts = opts || {};
    $app.className = opts.bar ? 'has-bar' : '';
    $app.innerHTML = html + tabbar(opts.tab) + (ONLINE ? '<span class="env-badge">' + esc(T('global.notes.envBadge', '测试环境')) + (PREVIEW ? '·预览' : '') + '</span>' : '');
    window.scrollTo(0, 0);
    closeModal();
  }

  /* ---------- 页面 ---------- */
  /* D'.12-6 线性图标（1.5px 线宽、24px 画布，颜色跟随文字） */
  var ICO = {
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>', mall: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    quote: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>', mine: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>', phone: '<path d="M6 3h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 014 5a2 2 0 012-2z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',
    empty: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 9h6M9 13h4"/>'
  };
  function ico(k, cls) { return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICO[k] || '') + '</svg>'; }
  /* D'.12-3 空状态（线条插图 + 一句话 + 按钮） */
  function emptyState(id, text, btnText, href, btnId) {
    return '<div class="empty-st" id="' + id + '"><svg viewBox="0 0 96 96" fill="none" stroke="#BFBFBF" stroke-width="1.5"><rect x="22" y="14" width="52" height="68" rx="6"/><path d="M34 34h28M34 46h28M34 58h16"/><circle cx="70" cy="70" r="12" fill="#fff"/><path d="M66 70h8"/></svg>' +
      '<p>' + esc(text) + '</p>' + (btnText ? '<a class="btn a"' + (btnId ? ' id="' + btnId + '"' : '') + ' href="' + href + '">' + esc(btnText) + '</a>' : '') + '</div>';
  }
  /* D'.12-2 骨架屏：和真实布局一致的灰块；超过 10 秒显示「网络较慢，点我重试」 */
  var skelTimer;
  function skeleton(kind) {
    clearTimeout(skelTimer);
    skelTimer = setTimeout(function () { var s = document.getElementById('skel'); if (s && !document.getElementById('slow-retry')) s.insertAdjacentHTML('beforeend', '<button class="slow-retry" id="slow-retry" onclick="location.reload()">网络较慢，点我重试</button>'); }, 10000);
    var h = kind === 'mine' ? [[64], [120], [88], [88]] : kind === 'detail' ? [[200], [80], [44], [160]] : [[96], [96], [96], [96]];
    return '<div class="skel" id="skel">' + h.map(function (x) { return '<i style="height:' + x[0] + 'px"></i>'; }).join('') + '</div>';
  }

  /* ---------- H 首页「案例与动态」 ---------- */
  function showcaseAll() {
    var items = T('home.showcase.items', D.showcase || []) || [];
    return items.filter(function (x) { return x.status === 'online'; }).sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
  }
  function scCover(x, cls) { return '<span class="' + cls + '">' + (x.cover ? '<img src="' + esc(x.cover) + '" alt="">' : '<span class="sc-logo">' + esc((S.company.short || '龙').slice(0, 1)) + '</span>') + '</span>'; }
  function scMeta(x) { return x.type === 'news' ? esc(x.publishDate || '') : esc((x.industry || '') + (x.qty ? ' · ' + x.qty + ' 台' : '')); }
  var scTab = 'case';
  function showcaseModule() {
    var all = showcaseAll().filter(function (x) { return x.showOnHome; });
    var types = ['case', 'news'].filter(function (t) { return all.some(function (x) { return x.type === t; }); });
    if (!types.length) return '';
    if (types.indexOf(scTab) < 0) scTab = types[0];
    var list = all.filter(function (x) { return x.type === scTab; }).slice(0, 8);
    return '<section class="sc-mod" id="showcase" data-sec="home.showcase"><div class="sc-hd"><h2>案例与动态</h2><a href="#/showcase?type=' + scTab + '" id="sc-all">查看全部 ＞</a></div>' +
      (types.length > 1 ? '<div class="sc-tabs" id="sc-tabs">' + types.map(function (t) { return '<button data-sct="' + t + '" class="' + (t === scTab ? 'on' : '') + '">' + (t === 'case' ? '客户案例' : '公司动态') + '</button>'; }).join('') + '</div>' : '') +
      '<div class="sc-row" id="sc-row">' + list.map(function (x) { return '<a class="sc-card" data-scid="' + esc(x.id) + '" href="#/showcase/' + esc(x.id) + '">' + scCover(x, 'sc-img') + '<b class="sc-t">' + esc(x.title) + '</b><span class="sc-s">' + esc(x.summary) + '</span><span class="sc-m">' + scMeta(x) + '</span></a>'; }).join('') +
      '<a class="sc-card sc-more" href="#/showcase?type=' + scTab + '">查看全部 ＞</a></div></section>';
  }
  function bindShowcase() {
    document.querySelectorAll('[data-sct]').forEach(function (b) { b.onclick = function () { scTab = b.dataset.sct; var m = document.getElementById('showcase'); m.outerHTML = showcaseModule(); bindShowcase(); }; });
  }
  function pageHome() {
    var hbg = T('home.hero.bg', '');
    render('<div class="home" data-sec="home.hero">' + (hbg ? '<div class="home-bg" id="home-bg" style="background-image:url(' + esc(hbg) + ')"></div>' : '') + '<div class="home-top"><div class="home-logo">' + esc(S.company.short.slice(0, 1)) + '</div>' +
      '<h1 id="home-title">' + esc(T('home.hero.title', S.company.name)) + '</h1><p class="slogan" id="home-slogan">' + esc(T('home.hero.slogan', S.company.slogan)) + '</p>' +
      '<a class="cta" id="enter-mall" href="#/mall" data-sec="home.cta">' + esc(T('home.cta.text', '进入租赁设备商城')) + '</a>' +
      '<a class="trust" href="#/guide" data-sec="home.trust">' + T('home.trust.items', ['对公发票', '正式合同', '上门维保']).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join(' · ') + '</a>' +
      '<a class="home-tel" href="tel:' + esc(S.company.phone) + '">' + ico('phone') + ' ' + esc(S.company.phone) + '</a></div>' +
      showcaseModule() +
      '<div class="foot"><a href="#/guide">对公采购流程</a><a href="#/guide">关于我们</a><a href="#/privacy">隐私说明</a><br>' + esc(S.company.icp) + ' · ' + (ONLINE ? '测试环境，数据均为示例' : '演示版，数据均为示例') + '</div></div>', { tab: 'home' });
    bindShowcase();
  }
  function pageShowcaseList(q) {
    var t = (q && q.type) || 'case', all = showcaseAll();
    var types = ['case', 'news'].filter(function (x) { return all.some(function (y) { return y.type === x; }); });
    if (types.length && types.indexOf(t) < 0) t = types[0];
    var list = all.filter(function (x) { return x.type === t; });
    render(nav('案例与动态', true) + (types.length > 1 ? '<div class="sc-tabs sc-tabs-l" id="scl-tabs">' + types.map(function (x) { return '<a href="#/showcase?type=' + x + '" class="' + (x === t ? 'on' : '') + '">' + (x === 'case' ? '客户案例' : '公司动态') + '</a>'; }).join('') + '</div>' : '') +
      (list.length ? '<div class="sc-list" id="sc-list">' + list.map(function (x) { return '<a class="sc-item" data-scid="' + esc(x.id) + '" href="#/showcase/' + esc(x.id) + '">' + scCover(x, 'sc-thumb') + '<span class="sc-tx"><b class="sc-t">' + esc(x.title) + '</b><span class="sc-s">' + esc(x.summary) + '</span><span class="sc-m">' + scMeta(x) + '</span></span></a>'; }).join('') + '</div><div class="sc-end">没有更多了</div>'
        : emptyState('sc-empty', '暂时没有内容', '去商城看看', '#/mall')), { tab: 'home' });
  }
  function pageShowcase(id) {
    var x = showcaseAll().filter(function (y) { return y.id === id; })[0];
    if (!x) return render(nav('案例与动态', true) + emptyState('sc-404', '内容不存在或已下架', '返回首页', '#/'), { tab: 'home' });
    var imgs = (x.images && x.images.length ? x.images : x.cover ? [x.cover] : []);
    var rel = (x.relatedPlanIds || []).map(function (pid) { return D.plans.filter(function (p) { return p.id === pid && p.status !== 'off'; })[0]; }).filter(Boolean);
    render(nav(x.type === 'case' ? '客户案例' : '公司动态', true) + '<div class="sc-detail" id="sc-detail"><div class="sc-hero">' + (imgs.length ? imgs.map(function (u) { return '<img src="' + esc(u) + '" alt="">'; }).join('') : '<span class="sc-logo">' + esc((S.company.short || '龙').slice(0, 1)) + '</span>') + '</div>' +
      '<div class="sc-body"><h1 id="sc-title">' + esc(x.title) + '</h1><div class="sc-m">' + scMeta(x) + (x.type === 'case' && !x.authorized ? ' · 单位名称已隐去' : '') + '</div>' +
      String(x.content || '').split('\n').map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      (rel.length ? '<div class="sc-rel" id="sc-rel"><h3>相关套餐</h3>' + rel.map(function (p) { return '<a class="sc-relc" href="#/plan/' + p.mode + '/' + p.slug + '">' + esc(p.name) + '<span class="price">' + priceHTML(p) + '</span></a>'; }).join('') + '</div>' : '') + '</div>' +
      '<div class="actbar sc-bar"><button class="btn a" id="sc-consult">咨询同款方案</button></div>', { tab: 'home', bar: true });
    $app.classList.add('dp-page');
    document.getElementById('sc-consult').onclick = function () {
      var go = function () { sessionStorage.setItem('rental_demo_consult', JSON.stringify(rel.length ? [defaultItem(rel[0])] : [])); sessionStorage.setItem('rental_demo_showcase', x.title); location.hash = '#/consult?from=showcase'; };
      if (!loginPhone()) return showLoginSheet(go); // H.5-3 未登录先弹微信登录
      go();
    };
  }
  /* 后台「页面管理」预览：套餐编辑页输入保障一行时，实时改预览里的首屏（不用先保存） */
  if (PREVIEW) window.addEventListener('message', function (e) {
    var d = e.data || {}; if (d.type !== 'dp-hl' || e.origin !== location.origin) return;
    var g = document.getElementById('d-guar'); if (!g) return;
    g.innerHTML = (d.tags || []).slice(0, 4).map(esc).join(' · ') + ((d.tags || []).some(function (x) { return /响应/.test(x); }) ? ' <em class="dp-lbl" id="guar-tbc">待客户确认</em>' : '') + '<span class="dp-arr">＞</span>'; g.hidden = !(d.tags || []).length;
  });

  var carTimer;
  function pageMall() {
    var bs = D.banners;
    render(nav('租赁设备商城', true) + '<a class="sbar sbar-link" id="mall-search" href="#/search"><span>🔍 搜套餐、品牌、型号、用途</span></a>' +
      '<div class="carousel" id="carousel" data-sec="mall.banners"><div class="slides">' + bs.map(function (b) { return '<a class="slide" href="' + esc(b.link) + '" style="background:' + (b.image ? 'linear-gradient(120deg,' + b.color + 'dd,' + b.color + '66),url(' + esc(b.image) + ') center/cover' : 'linear-gradient(120deg,' + b.color + ',' + b.color + 'cc)') + '"><b>' + esc(b.title) + '</b><span>' + esc(b.sub) + '</span></a>'; }).join('') +
      '</div><div class="dots">' + bs.map(function (_, i) { return '<i class="' + (i ? '' : 'on') + '"></i>'; }).join('') + '</div></div>' +
      '<div class="sell" data-sec="mall.sell">' + T('mall.sell.items', ['1 台起租', '按天/按月', '对公发票', '上门维保']).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
      '<a class="expo-card" id="entry-expo" data-sec="mall.expo" href="#/list/expo" style="background:linear-gradient(120deg,' + esc(T('mall.expo.color', '#EA580C')) + ',' + esc(T('mall.expo.color', '#EA580C')) + 'cc 60%,#FB923C)"><span class="tag">' + esc(T('mall.expo.tag', '🔥 展会专享')) + '</span><h2>' + esc(T('mall.expo.title', '展会快速租用')) + '</h2><p>' + esc(T('mall.expo.sub', '一天套餐 {price} 起 · 送装到展馆').replace('{price}', yen(minPrice('expo')))) + '</p><span class="go">' + esc(T('mall.expo.btn', '立即查看 →')) + '</span><span class="big">🎪</span></a>' +
      '<div class="two"><a id="entry-long" data-sec="mall.long" href="#/list/long"><div class="ic">📅</div><h3>' + esc(T('mall.long.title', '长期租用')) + '</h3><p>' + esc(T('mall.long.sub', '按月计费 · 含印量')) + '</p><div class="pr">' + yen(minPrice('long')) + '/月起</div></a>' +
      '<a id="entry-short" data-sec="mall.short" href="#/list/short"><div class="ic">⏱️</div><h3>' + esc(T('mall.short.title', '短期租用')) + '</h3><p>' + esc(T('mall.short.sub', '1 天起租 · 随租随还')) + '</p><div class="pr">' + yen(minPrice('short')) + '/天起</div></a></div>' +
      '<a class="reco-entry" id="reco-entry" href="#/recommend"><b>不知道选哪个？</b><span>回答 3 个问题，帮您推荐套餐 →</span></a>' +
      '<a class="gov" href="#/guide" data-sec="mall.gov">' + T('mall.gov.items', ['批量采购', '对公结算', '报价单']).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '<span>›</span></a>' + favBlock(), { tab: 'mall' });
    // 轮播：4 秒自动 + 手指滑动
    var i = 0, el = document.querySelector('#carousel .slides'), ds = document.querySelectorAll('#carousel .dots i');
    function go(n) { i = (n + bs.length) % bs.length; el.style.transform = 'translateX(-' + i * 100 + '%)'; ds.forEach(function (d, k) { d.className = k === i ? 'on' : ''; }); }
    clearInterval(carTimer); carTimer = setInterval(function () { if (document.body.contains(el)) go(i + 1); else clearInterval(carTimer); }, 4000);
    var x0 = null; el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* ---------- F 筛选优化（v8）：排序栏 + 快捷标签 + 已选条 + 右侧抽屉 + 实时结果数 + 空结果转线索；UI 完全由 D.filters（后台「筛选配置」）渲染 ---------- */
  var listState = {}, FLT_KEY = 'rental_demo_filters_v1';
  function fConf(mode) { return ((D.filters || {})[mode] || []).filter(function (x) { return x.enabled !== false; }).sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); }); }
  function pPrice(p) { return +(p.pricing[p.mode === 'long' ? 'monthlyFee' : 'dailyFee'] || 0); }
  function pRange(s) { if (s && typeof s === 'object') return [s.min || 0, s.max || 9999]; var n = (String(s || '').match(/\d+/g) || []).map(Number); if (!n.length) return null; if (/以下/.test(s)) return [0, n[0]]; if (/以上/.test(s)) return [n[0], 9999]; return [n[0], n[1] || n[0]]; }
  function pBrands(p) { return (p.devices || []).map(function (d) { return d.brand; }).filter(Boolean); }
  function niceNum(x) { var m = x >= 1000 ? 100 : x >= 100 ? 50 : 10; return Math.max(m, Math.round(x / m) * m); }
  function priceBands(mode) { // F6：按当前模式价格分布三等分（分位数），后台 site.filterPriceBands 可手工覆盖
    var o = (D.filterPriceBands || {})[mode]; if (o && o.length === 2 && +o[0] < +o[1]) return [+o[0], +o[1]];
    var ps = plans(mode).map(pPrice).filter(Boolean).sort(function (a, b) { return a - b; }); if (!ps.length) return [100, 200];
    var a = ps[Math.floor(ps.length / 3)], b = ps[Math.floor(ps.length * 2 / 3)]; if (b <= a) b = a + 1;
    return [a, b];
  }
  function unitOf(mode) { return mode === 'long' ? '/月' : '/天'; }
  function fOptions(mode, c) {
    if (c.key === 'usage') { var used = {}; plans(mode).forEach(function (p) { (p.usageTagIds || []).forEach(function (t) { used[t] = 1; }); }); return D.usageTags.filter(function (t) { return used[t.id]; }).map(function (t) { return { v: t.id, label: t.name }; }); }
    if (c.key === 'brand') { var bs = {}; plans(mode).forEach(function (p) { pBrands(p).forEach(function (b) { bs[b] = 1; }); }); return Object.keys(bs).map(function (b) { return { v: b, label: b }; }); }
    if (c.key === 'price') { var bd = priceBands(mode), u = unitOf(mode); return [{ v: 'b0', label: '<¥' + bd[0] + u, min: null, max: bd[0] - 0.01 }, { v: 'b1', label: '¥' + bd[0] + '–' + (bd[1] - 1), min: bd[0], max: bd[1] - 0.01 }, { v: 'b2', label: '≥¥' + bd[1] + u, min: bd[1], max: null }]; }
    return c.options || [];
  }
  function fTest(p, k, v) {
    var fa = p.filterAttrs || {}; // F9：后台必选的筛选属性优先；老数据没有时按设备/推荐印量/人数推算
    if ((k === 'color' || k === 'paper') && fa[k]) return fa[k] === v; // 待复核的占位值服务器不下发（M7），这里拿不到就按设备推算
    if ((k === 'pages' || k === 'people') && fa[k] === v) return true;
    switch (k) {
      case 'usage': return v.some(function (x) { return (p.usageTagIds || []).indexOf(x) >= 0; });
      case 'brand': return v.some(function (x) { return pBrands(p).indexOf(x) >= 0; });
      case 'color': return ((p.devices || []).some(function (d) { return d.color; }) ? 'color' : 'mono') === v;
      case 'paper': return ((p.devices || []).some(function (d) { return d.paper === 'A3'; }) ? 'A3' : 'A4') === v;
      case 'pages': var r = p.recommendPages || {}; if (r.min == null) return false; return v === 'lt1500' ? r.min < 1500 : v === '1500-4000' ? r.min < 4000 && r.max >= 1500 : r.max > 4000;
      case 'people': var g = pRange(p.peopleRange || p.suitablePeople); if (!g) return false; return v === 'le10' ? g[0] <= 10 : v === '10-30' ? g[0] < 30 && g[1] >= 10 : g[1] > 30;
      case 'price': var x = pPrice(p); return (v.min == null || x >= v.min) && (v.max == null || x <= v.max);
      case 'term': return (p.pricing.termOptionsMonths || []).indexOf(+v) >= 0;
      case 'days': return (p.pricing.minDays || 1) <= +v;
      case 'allin': return p.tier !== 'basic' || (p.highlightTags || []).indexOf('耗材全包') >= 0;
      case 'delivery': return p.mode !== 'long' && (p.delivery || {}).included !== false;
    }
    return true;
  }
  function fEmpty(v) { return v == null || v === '' || (Array.isArray(v) && !v.length); }
  function fMatch(p, f, skip) { return Object.keys(f).every(function (k) { return k === skip || fEmpty(f[k]) || fTest(p, k, f[k]); }); }
  function fRun(mode, f, skip) { return plans(mode).filter(function (p) { return fMatch(p, f, skip); }); }
  function fWith(f, k, v, multi) { var g = JSON.parse(JSON.stringify(f)); if (multi) g[k] = [v]; else g[k] = v; return g; }
  function fChips(mode, f) { // 已选条件：[{k, v, label}]
    var out = [];
    fConf(mode).forEach(function (c) {
      var v = f[c.key]; if (fEmpty(v)) return; var os = fOptions(mode, c);
      var lab = function (x) { var o = os.filter(function (o) { return o.v === x; })[0]; return o ? o.label : x; };
      if (c.key === 'price') return out.push({ k: 'price', label: v.band ? lab(v.band) : '¥' + (v.min != null ? v.min : 0) + '–' + (v.max != null ? v.max : '不限') + unitOf(mode) });
      if (c.type === 'switch') return out.push({ k: c.key, label: c.label.replace(/（.*）/, '') });
      (Array.isArray(v) ? v : [v]).forEach(function (x) { out.push({ k: c.key, v: Array.isArray(v) ? x : undefined, label: lab(x) }); });
    });
    return out;
  }
  function fLoad(mode) { try { return (JSON.parse(localStorage.getItem(FLT_KEY) || '{}'))[mode]; } catch (e) { return null; } }
  function fSave(mode, st) { var all = {}; try { all = JSON.parse(localStorage.getItem(FLT_KEY) || '{}'); } catch (e) {} all[mode] = st; localStorage.setItem(FLT_KEY, JSON.stringify(all)); }
  function fToQuery(f) { return Object.keys(f).filter(function (k) { return !fEmpty(f[k]); }).map(function (k) { var v = f[k]; return k + '=' + encodeURIComponent(k === 'price' ? (v.band || ((v.min != null ? v.min : '') + '-' + (v.max != null ? v.max : ''))) : Array.isArray(v) ? v.join(',') : v); }).join('&'); }
  function fFromQuery(mode, q) {
    var f = {}, has = false;
    fConf(mode).forEach(function (c) { var v = q[c.key]; if (v == null || v === '') return; has = true;
      if (c.key === 'price') { var o = fOptions(mode, c).filter(function (x) { return x.v === v; })[0]; if (o) f.price = { band: o.v, min: o.min, max: o.max }; else { var m = v.split('-'); f.price = { min: m[0] === '' ? null : +m[0], max: m[1] === '' || m[1] == null ? null : +m[1] }; } }
      else f[c.key] = c.type === 'multi' ? v.split(',') : v; });
    return has ? f : null;
  }
  function fSortList(mode, ps, st) {
    var cmp = st.sort === 'price' ? function (a, b) { return (pPrice(a) - pPrice(b)) * (st.dir === 'desc' ? -1 : 1); }
      : st.sort === 'hot' ? function (a, b) { return (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || (a.sort || 0) - (b.sort || 0); } : function (a, b) { return (a.sort || 0) - (b.sort || 0); };
    ps.sort(cmp);
    if (st.need && (st.need.people || st.need.pages)) { // F7：匹配需求的排前面（稳定排序）
      ps.forEach(function (p, i) { p._i = i; p._m = (!st.need.people || fTest(p, 'people', st.need.people)) && (!st.need.pages || fTest(p, 'pages', st.need.pages)); });
      ps.sort(function (a, b) { return (b._m ? 1 : 0) - (a._m ? 1 : 0) || a._i - b._i; });
    }
    return ps;
  }
  function pcardHTML(mode, p, match) {
    return '<a class="pcard" href="#/plan/' + mode + '/' + p.slug + '" data-pid="' + p.id + '"><div class="pimg">' + img(p) + '</div><div class="pinfo">' +
      '<div class="pname"><span class="tier ' + p.tier + '">' + TIER[p.tier] + '</span>' + esc(p.name) + (match ? '<span class="f-match">匹配需求</span>' : '') + '</div>' +
      '<div class="pts">' + (p.points || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="price">' + priceHTML(p) + '</div></div><button class="plus" data-add="' + p.id + '" aria-label="加入询价单"><i>+</i></button></a>';
  }
  function pageList(mode, q) {
    if (!MODES[mode]) return page404();
    var $ = function (id) { return document.getElementById(id); };
    var st = listState[mode] || (listState[mode] = fLoad(mode) || { sort: 'comp', dir: 'asc', f: {}, order: [], need: {} });
    st.f = st.f || {}; st.order = st.order || []; st.need = st.need || {};
    var fq = fFromQuery(mode, q || {}); if (fq) { st.f = fq; st.order = Object.keys(fq); }
    var conf = fConf(mode), byKey = {}; conf.forEach(function (c) { byKey[c.key] = c; });
    Object.keys(st.f).forEach(function (k) { if (!byKey[k]) delete st.f[k]; }); // 后台关掉的维度不再生效
    st.order = st.order.filter(function (k) { return !fEmpty(st.f[k]); });
    var ps = fSortList(mode, fRun(mode, st.f), st), chips = fChips(mode, st.f), n = qCount(), total = plans(mode).length;
    fSave(mode, st);
    var qs = fToQuery(st.f); try { history.replaceState(null, '', location.pathname + location.search + '#/list/' + mode + (qs ? '?' + qs : '')); } catch (e) {}
    var quick = conf.filter(function (c) { return c.quick; }).slice(0, 5).map(function (c) {
      var o = c.type === 'switch' ? { v: '1', label: (c.options && c.options[0] && c.options[0].label) || c.label } : fOptions(mode, c).filter(function (o) { return o.v === c.quick; })[0]; if (!o) return '';
      var on = c.type === 'multi' ? (st.f[c.key] || []).indexOf(o.v) >= 0 : st.f[c.key] === o.v;
      return '<button class="chip f-qk' + (on ? ' on' : '') + '" data-qk="' + c.key + '" data-qv="' + esc(o.v) + '"><span>' + esc(o.label) + '</span></button>';
    }).join('');
    var sortBar = '<div class="f-sort" id="f-sort">' + [['comp', '综合'], ['price', '价格'], ['hot', '热门']].map(function (s) {
      return '<button data-fs="' + s[0] + '" class="' + (st.sort === s[0] ? 'on' : '') + '">' + s[1] + (s[0] === 'price' ? '<i class="f-arr" id="f-arr">' + (st.sort === 'price' ? (st.dir === 'desc' ? '↓' : '↑') : '↕') + '</i>' : '') + '</button>'; }).join('') +
      '<button id="f-open" class="' + (chips.length ? 'on' : '') + '">筛选' + (chips.length ? '<b class="f-n">' + chips.length + '</b>' : '') + ' <svg class="ico" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg></button></div>';
    var chipBar = chips.length ? '<div class="f-chips" id="f-chips">' + chips.map(function (c) { return '<button class="f-chip" data-rmk="' + c.k + '"' + (c.v != null ? ' data-rmv="' + esc(c.v) + '"' : '') + '><span>' + esc(c.label) + ' ×</span></button>'; }).join('') + '<button class="f-clear" id="f-clear">清空</button></div>' : '';
    var body;
    if (ps.length) body = '<div id="f-list">' + ps.map(function (p) { return pcardHTML(mode, p, p._m && (st.need.people || st.need.pages)); }).join('') + '</div>' +
      '<div class="f-foot" id="f-foot">共 ' + ps.length + ' 个套餐 · ' + (st.sort === 'price' ? '价格从' + (st.dir === 'desc' ? '高到低' : '低到高') : st.sort === 'hot' ? '热门优先' : '综合排序') + (chips.length ? ' · <button class="f-share" id="f-share">分享这组结果</button>' : '') + '</div>';
    else {
      var near = null; st.order.slice().reverse().concat(Object.keys(st.f)).forEach(function (k) { if (fEmpty(st.f[k])) return; var r = fRun(mode, st.f, k); if (r.length && (!near || r.length > near.list.length)) near = { k: k, list: r }; });
      var nearLab = near ? chips.filter(function (c) { return c.k === near.k; }).map(function (c) { return c.label; }).join('、') : '';
      body = '<div class="empty-st f-empty" id="f-empty"><svg viewBox="0 0 96 96" fill="none" stroke="#BFBFBF" stroke-width="1.5"><circle cx="48" cy="44" r="26"/><path d="M42 36a6 6 0 1112 2c-2 2-6 3-6 8M48 54v2"/></svg>' +
        '<p class="f-et">没有完全符合的套餐</p><p class="f-es">已选：' + esc(chips.map(function (c) { return c.label; }).join(' · ')) + '</p>' +
        '<div class="f-eb"><button class="btn o" id="f-relax">放宽条件</button><button class="btn a" id="f-consult">找客服定制报价</button></div><p class="f-es">表单自动带上已选条件，客服一看就懂</p></div>' +
        (near ? '<div class="f-near" id="f-near"><h3>相近套餐（去掉「' + esc(nearLab) + '」后）</h3>' + near.list.slice(0, 3).map(function (p) { return pcardHTML(mode, p); }).join('') + '</div>' : '');
    }
    render(nav(MODES[mode].title, true) + '<div class="modebar" data-sec="list_' + mode + '.head">' + MODES[mode].icon + ' ' + MODES[mode].bar + '</div>' +
      '<div class="f-top" id="f-top">' + sortBar + (quick ? '<div class="f-quick filters" id="f-quick">' + quick + '</div>' : '') + chipBar + '</div>' + body +
      '<a class="fab" href="#/quote" aria-label="询价单">' + ico('quote') + (n ? '<span class="dot">' + n + '</span>' : '') + '</a>', { tab: 'mall' });
    var again = function () { pageList(mode); };
    var setF = function (k, v) { if (fEmpty(v)) delete st.f[k]; else st.f[k] = v; st.order = st.order.filter(function (x) { return x !== k; }); if (!fEmpty(v)) st.order.push(k); };
    $app.querySelectorAll('[data-fs]').forEach(function (b) { b.onclick = function () { var s = b.dataset.fs; if (s === 'price') st.dir = st.sort === 'price' && st.dir === 'asc' ? 'desc' : 'asc'; st.sort = s; again(); }; });
    $app.querySelectorAll('[data-qk]').forEach(function (b) { b.onclick = function () {
      var c = byKey[b.dataset.qk], v = b.dataset.qv;
      if (c.type === 'multi') { var a = (st.f[c.key] || []).slice(), i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); setF(c.key, a); }
      else setF(c.key, st.f[c.key] === v ? null : v);
      again(); }; });
    $app.querySelectorAll('[data-rmk]').forEach(function (b) { b.onclick = function () { var k = b.dataset.rmk, v = b.dataset.rmv; if (v != null && Array.isArray(st.f[k])) setF(k, st.f[k].filter(function (x) { return x !== v; })); else setF(k, null); again(); }; });
    var clr = $('f-clear'); if (clr) clr.onclick = function () { st.f = {}; st.order = []; again(); };
    var rl = $('f-relax'); if (rl) rl.onclick = function () { var k = st.order[st.order.length - 1] || Object.keys(st.f).pop(); setF(k, null); again(); };
    var fc = $('f-consult'); if (fc) fc.onclick = function () {
      sessionStorage.setItem('rental_demo_filters', JSON.stringify({ mode: mode, f: st.f, text: MODES[mode].title + '：' + chips.map(function (c) { return c.label; }).join('、') }));
      location.hash = '#/consult?from=filter';
    };
    var sh = $('f-share'); if (sh) sh.onclick = function () {
      var url = location.href.split('#')[0] + '#/list/' + mode + '?' + fToQuery(st.f), title = chips.map(function (c) { return c.label; }).join(' ') + ' 套餐 · ' + ps.length + ' 款';
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { toast('已复制链接：' + title); }, function () { toast(title); });
      sh.dataset.url = url; sh.dataset.title = title;
    };
    $app.querySelectorAll('.pcard').forEach(function (a) { a.addEventListener('click', function () { st.scroll = window.scrollY; fSave(mode, st); }); });
    $app.querySelectorAll('[data-add]').forEach(function (b) { b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); addToQuote(defaultItem(planById(b.dataset.add))); }; });
    $('f-open').onclick = function () { openFilter(mode, st, again); };
    if (st.scroll) { var y = st.scroll; st.scroll = 0; fSave(mode, st); setTimeout(function () { window.scrollTo(0, y); }, 0); } // F10 返回列表恢复位置
  }
  function openFilter(mode, st, done) {
    var tmp = JSON.parse(JSON.stringify(st.f)), need = JSON.parse(JSON.stringify(st.need || {})), order = st.order.slice(), open = {};
    var conf = fConf(mode), host = document.getElementById('modal');
    function cnt(c, o) { var g = JSON.parse(JSON.stringify(tmp)); if (c.key === 'price') g.price = { band: o.v, min: o.min, max: o.max }; else g[c.key] = c.type === 'multi' ? [o.v] : o.v; return fRun(mode, g).length; }
    function set(k, v) { if (fEmpty(v)) delete tmp[k]; else tmp[k] = v; order = order.filter(function (x) { return x !== k; }); if (!fEmpty(v)) order.push(k); }
    function pill(attr, on, dis, label, n) { return '<button class="f-op' + (on ? ' on' : '') + '" ' + attr + (dis && !on ? ' disabled' : '') + '><span>' + esc(label) + (n != null ? ' <em>(' + n + ')</em>' : '') + '</span></button>'; }
    function needBlock() {
      var P = (D.filters.long.filter(function (c) { return c.key === 'people'; })[0] || {}).options || [], G = (D.filters.long.filter(function (c) { return c.key === 'pages'; })[0] || {}).options || [];
      return '<div class="f-dim" id="f-need"><div class="f-dh"><b>按需求选</b><span>选完后匹配的排前面</span></div><div class="f-ops">' +
        P.map(function (o) { return pill('data-need="people|' + o.v + '"', need.people === o.v, false, o.label); }).join('') + '</div>' +
        (mode === 'long' ? '<div class="f-ops">' + G.map(function (o) { return pill('data-need="pages|' + o.v + '"', need.pages === o.v, false, o.label); }).join('') + '</div>' : '') + '</div>';
    }
    function draw() {
      var html = (mode !== 'expo' ? needBlock() : '') + conf.map(function (c) {
        var os = fOptions(mode, c), v = tmp[c.key];
        if (c.type === 'switch') return '<div class="f-dim f-sw" data-dim="' + c.key + '"><div class="f-dh"><b>' + esc(c.label) + '</b><button class="f-tg' + (v ? ' on' : '') + '" data-fsw="' + c.key + '" role="switch" aria-checked="' + (!!v) + '" aria-label="' + esc(c.label) + '"><i></i></button></div></div>';
        var many = os.length > 3 && !open[c.key], show = many ? os.slice(0, 3) : os;
        var h = '<div class="f-dim" data-dim="' + c.key + '"><div class="f-dh"><b>' + esc(c.label) + (c.key === 'price' ? '（' + unitOf(mode) + '）' : '') + '</b>' + (os.length > 3 ? '<button class="f-all" data-fall="' + c.key + '">' + (open[c.key] ? '收起 ∧' : '全部 ＞') + '</button>' : '') + '</div><div class="f-ops">' +
          show.map(function (o) { var on = c.key === 'price' ? !!(v && v.band === o.v) : c.type === 'multi' ? (v || []).indexOf(o.v) >= 0 : v === o.v, n = cnt(c, o); return pill('data-fo="' + c.key + '|' + esc(o.v) + '"', on, n === 0, o.label, n); }).join('') + '</div>';
        if (c.key === 'price') h += '<div class="f-rg"><input id="f-min" type="number" inputmode="numeric" placeholder="最低价" value="' + (v && !v.band && v.min != null ? v.min : '') + '"><span>—</span><input id="f-max" type="number" inputmode="numeric" placeholder="最高价" value="' + (v && !v.band && v.max != null ? v.max : '') + '"></div>';
        return h + '</div>';
      }).join('');
      host.innerHTML = '<div class="f-mask" id="f-mask"></div><aside class="f-drawer" id="f-drawer" role="dialog" aria-label="筛选"><div class="f-body">' + html + '</div>' +
        '<div class="f-ft"><button class="btn o" id="f-reset">重置</button><button class="btn a" id="f-ok">确定（' + fRun(mode, tmp).length + ' 个套餐）</button></div></aside>';
      bind();
    }
    function bind() {
      host.querySelectorAll('[data-fo]').forEach(function (b) { b.onclick = function () {
        var kv = b.dataset.fo.split('|'), c = conf.filter(function (x) { return x.key === kv[0]; })[0], v = kv.slice(1).join('|');
        if (c.key === 'price') { var o = fOptions(mode, c).filter(function (x) { return x.v === v; })[0]; set('price', tmp.price && tmp.price.band === v ? null : { band: v, min: o.min, max: o.max }); }
        else if (c.type === 'multi') { var a = (tmp[c.key] || []).slice(), i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); set(c.key, a); }
        else set(c.key, tmp[c.key] === v ? null : v);
        draw(); }; });
      host.querySelectorAll('[data-fsw]').forEach(function (b) { b.onclick = function () { set(b.dataset.fsw, tmp[b.dataset.fsw] ? null : '1'); draw(); }; });
      host.querySelectorAll('[data-fall]').forEach(function (b) { b.onclick = function () { open[b.dataset.fall] = !open[b.dataset.fall]; draw(); }; });
      host.querySelectorAll('[data-need]').forEach(function (b) { b.onclick = function () { var kv = b.dataset.need.split('|'); need[kv[0]] = need[kv[0]] === kv[1] ? '' : kv[1]; draw(); }; });
      var mi = document.getElementById('f-min'), ma = document.getElementById('f-max');
      if (mi) { var rg = function () { var a = mi.value === '' ? null : +mi.value, b = ma.value === '' ? null : +ma.value; if (a != null && b != null && a > b) { var t = a; a = b; b = t; } set('price', a == null && b == null ? null : { min: a, max: b });
        var ok = document.getElementById('f-ok'); ok.textContent = '确定（' + fRun(mode, tmp).length + ' 个套餐）'; host.querySelectorAll('[data-fo^="price|"]').forEach(function (x) { x.classList.remove('on'); }); };
        mi.oninput = rg; ma.oninput = rg; mi.onchange = ma.onchange = function () { var a = mi.value, b = ma.value; if (a !== '' && b !== '' && +a > +b) { mi.value = b; ma.value = a; } }; } // 不重绘，避免打断另一个输入框
      document.getElementById('f-mask').onclick = function () { host.innerHTML = ''; }; // 点遮罩关闭，不应用
      document.getElementById('f-reset').onclick = function () { tmp = {}; need = {}; order = []; draw(); };
      document.getElementById('f-ok').onclick = function () { st.f = tmp; st.need = need; st.order = order; host.innerHTML = ''; done(); };
    }
    draw();
  }

  function defaultItem(p) {
    var it = { id: 'q' + Date.now() + Math.floor(Math.random() * 1000), planId: p.id, mode: p.mode, qty: 1 };
    if (p.mode === 'long') it.months = (p.pricing.termOptionsMonths || [12])[0];
    else { it.days = p.mode === 'expo' ? 1 : 3; it.startDate = today(p.mode === 'expo' ? 7 : 1); }
    if (p.mode === 'expo') it.expo = {};
    return it;
  }
  function addToQuote(it) {
    var items = loadQ(); var b = budget(it); if (b) { it.budgetMin = b.min; it.budgetMax = b.max; }
    items.push(it); saveQ(items); refreshCounts(); showBudget(it);
  }
  function refreshCounts() {
    var n = qCount();
    document.querySelectorAll('.qbadge, .tabbar a[href="#/quote"], .fab, .actbar .mini.q').forEach(function (a) {
      var d = a.querySelector('.dot'); if (!d && n) { d = document.createElement('span'); d.className = 'dot'; a.appendChild(d); }
      if (d) { d.textContent = n; d.style.display = n ? '' : 'none'; }
    });
  }

  /* ---------- D' 详情页（v6 京东/淘宝式）：长租/短租/展会共用一个组件，只换价格单位、已选行、面板字段、主按钮文字 ---------- */
  var DP_TABS = ['商品', '服务', '参数', '案例问答'];
  var GUAR_NOTE = { '上门维保': '市区工作时间内上门维修，修不好提供备用机', '耗材全包': '墨粉/硒鼓按印量配送，不另收费（超印部分按张计费）', '正式合同': '签订正式租赁合同，对公结算，可开增值税发票', '4h响应': '报修后 4 小时内响应（具体时效待客户确认）', '4 小时响应': '报修后 4 小时内响应（具体时效待客户确认）', '免费送装': '确认后安排送装、安装调试', '对公结算': '支持对公转账、开具发票' };
  var VOL_TIERS = [{ v: 1000, t: '<1500' }, { v: 3000, t: '1500–4000' }, { v: 6000, t: '4000–8000' }, { v: 10000, t: '8000+' }];
  function pageDetail(mode, slug) {
    var p = plans(mode).filter(function (x) { return x.slug === slug; })[0];
    if (!p) return page404();
    var it = defaultItem(p), r = p.pricing, dev = p.devices, chosen = false, fromAdd = false;
    var DC = D.detailCommon || {}, sla = DC.sla || {}, areas = DC.serviceAreas || [], rp = p.recommendPages || null;
    var btn1 = mode === 'expo' ? T('plan_detail.buttons.addExpo', '立即预约') : T('plan_detail.buttons.add', '加入询价单');
    var tabs = T('plan_detail.tabs.items', DP_TABS); if (!tabs || tabs.length !== 4) tabs = DP_TABS;
    var unit = mode === 'long' ? '/月' : '/天';
    it.vol = rp ? Math.round((rp.min + rp.max) / 2 / 500) * 500 : (r.includedMono || 3000);
    function lbl(t, id) { return ' <em class="dp-lbl"' + (id ? ' id="' + id + '"' : '') + '>' + t + '</em>'; } // D.4 标注：灰色小字，不算标签
    function row(k, v, id, more) { return '<div class="dp-row"' + (id ? ' id="' + id + '"' : '') + '><span class="dp-k">' + esc(k) + '</span><span class="dp-v">' + v + '</span>' + (more ? '<span class="dp-arr">＞</span>' : '') + '</div>'; }
    function card(title, body, id, block, extra) { return '<section class="dp-card"' + (id ? ' id="' + id + '"' : '') + (block ? ' data-block="' + block + '"' : '') + (extra || '') + '>' + (title ? '<h4 class="dp-h">' + title + '</h4>' : '') + body + '</section>'; }
    // ① 大图轮播（官方图 / 实拍分组）
    var gg = p.galleryUrls || {}, off = (gg.official && gg.official.length ? gg.official : (p.images || []).filter(Boolean)), real = gg.real || [];
    var slides = (off.length ? off.map(function (u) { return { g: 'official', h: '<img src="' + esc(u) + '" alt="">' }; }) : [{ g: 'official', h: img(p) }])
      .concat(real.length ? real.map(function (u) { return { g: 'real', h: '<img src="' + esc(u) + '" alt="">' }; }) : [{ g: 'real', h: '<div class="dp-noreal">实拍图待补充</div>' }]);
    var gal = '<div class="dp-gal" id="d-gallery" data-block="1"><div class="dp-track" id="g-track">' + slides.map(function (s) { return '<div class="dp-slide" data-g="' + s.g + '">' + s.h + '</div>'; }).join('') + '</div>' +
      '<div class="dp-gsw"><button class="on" data-gg="official"><span>官方图</span></button><button data-gg="real"><span>实拍</span></button></div><span class="dp-idx" id="g-idx">1/' + slides.length + '</span>' +
      '<div class="dp-ops"><button id="btn-fav" aria-label="收藏"><span>' + (isFav(p.id) ? '★ 已收藏' : '☆ 收藏') + '</span></button><button id="btn-share" aria-label="分享"><span>分享海报</span></button></div></div>';
    // 价格 · 标题 · 保障一行 · 已选行
    var hl = (p.highlightTags && p.highlightTags.length ? p.highlightTags : (p.guarantees || [])).slice(0, 4);
    var head = '<section class="dp-card dp-head" data-block="2"><div class="dp-price dprice" id="d-price"></div>' +
      '<div class="dp-pnote" id="price-note">' + esc(T('global.notes.priceNote', '最终以商务报价为准')) + '</div>' +
      '<h1 class="dp-title dname" id="d-title">' + esc(p.name.indexOf(TIER[p.tier]) >= 0 ? p.name : p.name + ' · ' + TIER[p.tier] + '套餐') + '</h1>' +
      (hl.length ? '<button class="dp-guar" id="d-guar">' + hl.map(esc).join(' · ') + (hl.some(function (x) { return /响应/.test(x); }) ? lbl('待客户确认', 'guar-tbc') : '') + '<span class="dp-arr">＞</span></button>' : '') + '</section>' +
      '<button class="dp-card dp-sel" id="d-sel"><span class="dp-k">已选</span><span class="dp-v" id="d-sel-v"></span><span class="dp-arr">＞</span></button>';
    // ② 吸顶 Tab
    var tabbarH = '<div class="dp-tabs-ph" id="d-tabs-ph"><div class="dp-tabs" id="d-tabs">' + tabs.map(function (t, i) { return '<button data-dtab="' + i + '"' + (i ? '' : ' class="on"') + '>' + esc(t) + '</button>'; }).join('') + '</div></div>';
    // 商品 Tab：场景（D8）、同系列对比（B5）
    var sibs = plans(mode).slice().sort(function (a, b) { return ['basic', 'allin', 'premium'].indexOf(a.tier) - ['basic', 'allin', 'premium'].indexOf(b.tier); });
    var scenesTxt = (p.scenes || []).slice(0, 4).map(function (x) { return esc(x.name); }).join(' · ');
    var goods = card('商品', (p.tagline ? row('卖点', esc(p.tagline)) : '') + (scenesTxt ? row('场景', scenesTxt, 'scenes') : '') + row('适用', esc(p.suitablePeople || '—')) +
      (sibs.length > 1 ? '<div id="compare" data-block="9"><table class="dp-cmp"><tr><th></th>' + sibs.map(function (x) { return '<th class="' + (x.id === p.id ? 'cur' : '') + '">' + TIER[x.tier] + '</th>'; }).join('') + '</tr>' +
        '<tr><td>价格</td>' + sibs.map(function (x) { return '<td class="' + (x.id === p.id ? 'cur' : '') + '">' + yen(fromPrice(x)) + '</td>'; }).join('') + '</tr>' +
        '<tr><td>要点</td>' + sibs.map(function (x) { return '<td class="' + (x.id === p.id ? 'cur' : '') + '">' + esc((x.points || []).slice(0, 2).join(' / ')) + '</td>'; }).join('') + '</tr>' +
        '<tr><td></td>' + sibs.map(function (x) { return '<td class="' + (x.id === p.id ? 'cur' : '') + '">' + (x.id === p.id ? '当前' : '<a href="#/plan/' + mode + '/' + x.slug + '">查看 ＞</a>') + '</td>'; }).join('') + '</tr></table></div>' : ''),
      'sec-0', 8, ' data-sub="scenes"');
    // 服务 Tab：响应时效（D3）、包含/不包含/送装（D4 D5）、范围（D16）、检测、流程（B4）、增值（D12 D13）、勘测（D11）
    var si = p.serviceItems || [], dl = p.delivery || {};
    var inc = si.filter(function (x) { return x.included; }).map(function (x) { return esc(x.name); }).join(' · '), exc = si.filter(function (x) { return !x.included; }).map(function (x) { return esc(x.name); }).join(' · ');
    var pr = (r.includedMono ? '黑白 ' + r.includedMono + ' 张/月' + (r.includedColor ? '，彩色 ' + r.includedColor + ' 张/月' : '') : '') + (r.overageMono ? '；超印黑白 ¥' + r.overageMono + '/张' + (r.overageColor ? '、彩色 ¥' + r.overageColor + '/张' : '') : '');
    var service = card('服务',
      '<div class="dp-lblrow" id="sla-tbc">服务时效' + lbl('待客户确认') + '</div><div class="dp-sla" id="sla" data-block="3"><div><b>' + (sla.respondH || 2) + 'h</b><span>响应</span></div><div><b>' + (sla.arriveH || 4) + 'h</b><span>到场</span></div><div><b>备用机</b><span>' + esc(sla.spare || '修不好提供备用机') + '</span></div></div>' +
      '<div id="service" data-block="7">' + (inc ? row('包含', inc + lbl('待客户确认', 'inc-tbc')) : '') + (exc ? row('不包含', exc + lbl('待客户确认', 'exc-tbc')) : '') + (pr ? row('印量', esc(pr)) : '') +
      p.includes.map(function (x) { return row(x.label, esc(x.value)); }).join('') + row('送装', esc(dl.note || '确认后安排送装'), 'delivery') +
      (mode === 'expo' ? row('展会', T('plan_detail.expo_steps.items', ['在线预约', '送装到展位', '现场调试', '撤展回收']).map(esc).join(' → '), 'expo-steps') : '') + '</div>' +
      (areas.length ? '<details class="dp-fold" id="areas" data-block="16"><summary>' + row('范围', esc(areas.map(function (x) { return x.area; }).join('、')) + lbl('示例', 'areas-ex'), '', true) + '</summary><div class="dp-sub">' + areas.map(function (x) { return esc(x.area + ' · ' + x.time); }).join('<br>') + '</div></details>' : '') +
      row('检测', '出租前 ' + (p.inspectionItems || 20) + ' 项检测（示例）', 'inspect') +
      row('保障', T('plan_detail.gov.items', ['正式合同', '对公发票', '资质齐全']).map(esc).join(' · '), 'gov-row') +
      '<div data-block="12">' + row('流程', ['询价', '报价', '签约', '送装', '使用维保', '到期'].join(' → '), 'rent-flow') + '</div>' +
      '<details class="dp-fold" id="vas" data-block="D12"><summary>' + row('增值服务', '用量管理：每月印量报表、超量提醒', '', true) + '</summary><div class="dp-sub">每月推送用量报表；接近含印量时提前提醒；可按部门统计（示例）</div></details>' +
      '<details class="dp-fold" id="adjust" data-block="D13"><summary>' + row('合作期间调整', '加机 / 减机 / 升档', '', true) + '</summary><div class="dp-sub">合作期间可按需加减台数、升级档位，按剩余租期重新计费（以合同为准）</div></details>' +
      '<a class="dp-link" id="btn-survey" data-block="13">预约免费上门勘测 ＞</a>',
      'sec-1');
    // 参数 Tab（D7 D15）
    var sp = p.specs || {}, cons = p.consumables || [];
    var prow = dev.map(function (d) { return row('设备', esc(d.brand + ' ' + d.model + '（' + d.type + '）× ' + d.qty + ' · ' + d.condition)); })
      .concat(Object.keys(sp).map(function (k) { return row(k, esc(sp[k])); }))
      .concat(cons.map(function (c) { return row(c.name, esc(c.yield)); }))
      .concat([row('环保', '节能认证 · 原装耗材回收（示例）', 'eco')]);
    var params = card('参数', '<div id="specs" data-block="10">' + prow.map(function (h, i) { return i < 8 ? h : h.replace('class="dp-row"', 'class="dp-row dp-more" hidden'); }).join('') + '</div>' +
      (prow.length > 8 ? '<button class="dp-link" id="specs-more">查看全部（' + prow.length + ' 项）＞</button>' : ''), 'sec-2');
    // 案例问答 Tab（D9 D10 B6）
    var cs = D.cases || [];
    var cases = card('案例问答', '<div data-block="11"><div id="certs" data-sub="certs">' + row('资质', '<span class="dp-thumbs">' + ['营业执照', '厂家授权书', '工程师认证'].map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</span>') + '</div>' +
      '<div id="cases" data-sub="cases">' + cs.map(function (c, i) { return '<div class="dp-case' + (i >= 3 ? ' dp-more' : '') + '"' + (i >= 3 ? ' hidden' : '') + '><b>' + esc(c.name) + '</b><p>' + esc(c.text) + '</p></div>'; }).join('') + (cs.length > 3 ? '<button class="dp-link" id="cases-more">查看更多 ＞</button>' : '') + '</div></div>' +
      '<div id="faq">' + (D.faqs || []).map(function (f) { return '<details class="dp-fold faq"><summary>' + row('问答', esc(f.q), '', true) + '</summary><div class="dp-sub">' + esc(f.a) + '</div></details>'; }).join('') + '</div>', 'sec-3');
    // 底栏（14）
    var bar = '<div class="actbar dp-bar" data-block="14"><button class="mini" id="btn-cs" aria-label="客服"><span class="ic">' + ico('chat') + '</span>客服</button>' +
      '<button class="btn a" id="btn-add" data-sec="plan_detail.buttons">' + esc(btn1) + '</button><button class="btn p" id="btn-consult">' + esc(T('plan_detail.buttons.consult', '直接找客服报价')) + '</button></div>';
    // 「已选」底部面板（B2 D2 B3 D1 D14）
    var thumb = off.length ? '<img src="' + esc(off[0]) + '" alt="">' : img(p), ps = '';
    if (mode === 'long') {
      ps = '<div class="dp-ph" data-block="5" id="tier-prices">租期（阶梯价）' + lbl('示例', 'tier-ex') + '</div><div class="dp-opts">' + (r.termOptionsMonths || [12]).map(function (m) { return '<button class="dp-opt" data-months="' + m + '"><b>' + m + ' 个月</b><small>' + yen(unitPrice(p, { mode: 'long', months: m, qty: 1 })) + '/月</small></button>'; }).join('') + '</div>' +
        '<div class="dp-ph">台数</div>' + stepper('qty', 1) +
        '<div class="dp-ph" data-block="4" id="pages-match">每月印量（印量匹配）</div><div class="dp-opts">' + VOL_TIERS.map(function (x) { return '<button class="dp-opt" data-vol="' + x.v + '"><b>' + x.t + '</b></button>'; }).join('') + '</div>' +
        '<div class="dp-hint" id="pm-out"></div>';
    } else if (mode === 'short') {
      ps = '<div class="dp-ph">开始日期</div><input class="f" type="date" id="sdate" value="' + it.startDate + '">' +
        '<div class="dp-ph" data-block="5" id="tier-prices">天数（阶梯价）' + lbl('示例', 'tier-ex') + '</div><div class="dp-opts">' + (r.dayTiers || []).map(function (t, i, a) { return '<button class="dp-opt" data-dt="' + t.minDays + '"><b>' + t.minDays + (a[i + 1] ? '–' + (a[i + 1].minDays - 1) : '+') + ' 天</b><small>' + yen(t.dailyFee) + '/天</small></button>'; }).join('') + '</div>' + stepper('days', it.days) +
        '<div class="dp-ph">台数</div>' + stepper('qty', 1) + '<div class="dp-hint" id="caphint" hidden></div>';
    } else {
      ps = '<div class="dp-ph">展会日期</div><input class="f" type="date" id="sdate" value="' + it.startDate + '"><div class="dp-ph">展期天数</div>' + stepper('days', it.days) +
        '<div class="dp-ph">台数</div>' + stepper('qty', 1) +
        '<div class="dp-ph">送装地址</div><input class="f" id="venue" placeholder="选填，展馆/展位号"><input class="f" id="ename" placeholder="选填，展会名称" style="margin-top:8px"><input class="f" id="dtime" placeholder="选填，送装时间，如：布展日 9:00" style="margin-top:8px">' +
        '<div class="dp-ph" data-block="5" id="tier-prices">送装费' + lbl('示例', 'tier-ex') + '</div><div class="dp-v">' + yen(r.fixedFee || 0) + '/次（一次性）</div>';
    }
    var sheet = '<div class="dp-mask" id="sel-mask" hidden><div class="dp-sheet" id="sel-sheet"><div class="dp-sh-h"><span class="dp-th">' + thumb + '</span><div><div class="dp-price" id="sh-price"></div><div class="dp-g" id="sh-sel"></div></div><button class="dp-x" id="sh-close" aria-label="关闭">×</button></div>' +
      '<div class="dp-sh-b" id="selector" data-mode="' + mode + '" data-block="6">' + ps + '<div class="dp-hint" id="bulk-hint" data-block="D14" hidden>台数 ≥5：可申请批量方案，联系客服获取阶梯折扣</div>' +
      '<div class="dp-ph">成本测算' + lbl('示例', 'calc-ex') + '</div><div class="dp-cost" id="calcout"></div>' + (mode === 'long' && p.perPageCalc ? '<details class="dp-fold" id="calc-vs-wrap"><summary>' + row('与自购对比', '（展开）', '', true) + '</summary><div class="dp-sub" id="calc-vs"></div></details>' : '') +
      '<div class="dp-g" id="bill-text" data-sec="plan_detail.bill">' + esc(T('plan_detail.bill.' + mode, '')) + '　测算仅供参考，以商务报价为准</div></div>' +
      '<div class="dp-sh-f"><button class="btn a block" id="sh-ok">确定</button></div></div></div>';
    addRecent(p);
    render(nav(MODES[mode].title, true) + '<div class="dp" id="dp">' + gal + head + tabbarH + goods + service + params + cases + '</div>' + bar + sheet, { tab: 'mall', bar: true });
    $app.classList.add('dp-page');
    function stepper(k, v) { return '<div class="step"><button data-dec="' + k + '" aria-label="减">−</button><input id="' + k + '" type="number" inputmode="numeric" min="1" value="' + v + '"><button data-inc="' + k + '" aria-label="加">+</button></div>'; }
    function fromPrice(x) { var q = x.pricing; return x.mode === 'long' ? Math.min.apply(null, (q.termPrices || []).map(function (t) { return t.monthlyFee; }).concat([q.monthlyFee || 1e9])) : x.mode === 'short' ? Math.min.apply(null, (q.dayTiers || []).map(function (t) { return t.dailyFee; }).concat([q.dailyFee || 1e9])) : q.dailyFee; }
    function $(id) { return document.getElementById(id); }
    function num(id) { var v = parseInt($(id).value, 10); return v > 0 ? v : 1; }
    // 轮播
    var gi = 0, tr = $('g-track');
    function go(n) { gi = Math.max(0, Math.min(slides.length - 1, n)); tr.style.transform = 'translateX(-' + gi * 100 + '%)'; $('g-idx').textContent = (gi + 1) + '/' + slides.length; document.querySelectorAll('[data-gg]').forEach(function (b) { b.classList.toggle('on', b.dataset.gg === slides[gi].g); }); }
    document.querySelectorAll('[data-gg]').forEach(function (b) { b.onclick = function () { for (var i = 0; i < slides.length; i++) if (slides[i].g === b.dataset.gg) return go(i); }; });
    var x0 = null; tr.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    tr.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(gi + (dx < 0 ? 1 : -1)); x0 = null; });
    function read() {
      it.qty = num('qty');
      if (mode !== 'long') { it.days = num('days'); it.startDate = $('sdate').value; }
      if (mode === 'expo') it.expo = { name: $('ename').value.trim(), venue: $('venue').value.trim(), deliveryTime: $('dtime').value.trim() };
    }
    function selText() {
      if (mode === 'long') return it.months + ' 个月 · ' + it.qty + ' 台 · 每月约 ' + it.vol + ' 张';
      if (mode === 'short') return it.days + ' 天 · ' + it.qty + ' 台';
      return (it.startDate || '日期待定') + ' · ' + it.days + ' 天 · ' + it.qty + ' 台' + (it.expo && it.expo.venue ? ' · ' + it.expo.venue : '');
    }
    function update() {
      read(); var up = unitPrice(p, it), ph = '¥' + up + '<small>' + unit + (chosen ? '' : '起') + '</small>';
      $('d-price').innerHTML = chosen ? ph : '¥' + fromPrice(p) + '<small>' + unit + (mode === 'expo' ? '' : '起') + '</small>';
      $('sh-price').innerHTML = '¥' + up + '<small>' + unit + '</small>' + lbl('示例', 'shp-ex');
      $('d-sel-v').textContent = chosen ? selText() : '请选择' + (mode === 'long' ? '租期 · 台数 · 月印量' : mode === 'short' ? '天数 · 台数' : '日期 · 台数 · 送装地址');
      $('sh-sel').textContent = '已选 ' + selText();
      $('bulk-hint').hidden = it.qty < 5;
      if (mode === 'long') {
        document.querySelectorAll('[data-months]').forEach(function (b) { b.classList.toggle('on', +b.dataset.months === it.months); });
        var vt = VOL_TIERS.filter(function (x) { return x.v === it.vol; })[0];
        document.querySelectorAll('[data-vol]').forEach(function (b) { b.classList.toggle('on', vt && +b.dataset.vol === vt.v); });
        var vol = it.vol, over = Math.max(0, vol - (r.includedMono || 0) * it.qty), monthly = Math.round(up * it.qty + over * (r.overageMono || 0)), pc = p.perPageCalc;
        $('calcout').innerHTML = '月费 <b id="calc-month">' + yen(monthly) + '</b> · 合同总额 <b id="calc-total">' + yen(monthly * it.months) + '</b> · 折合 <b id="calc-perpage">¥' + (vol ? (monthly / vol).toFixed(3) : '—') + '</b>/张';
        if (pc && $('calc-vs')) { var buy = Math.round(pc.buyPrice * it.qty / (pc.months || 36) + pc.consumableCostPerPage * vol + pc.maintPerMonth * it.qty); $('calc-vs').innerHTML = '租赁 ' + yen(monthly) + '/月　自购（折算）' + yen(buy) + '/月<br>自购 = 购机价按 ' + (pc.months || 36) + ' 个月折算 + 耗材 + 维修预估（示例）'; }
        if (rp) {
          var sibsAll = plans(mode).filter(function (x) { return x.recommendPages; }), msg;
          if (vol >= rp.min && vol <= rp.max) msg = '✓ 适合您：本档推荐每' + rp.unit + ' ' + rp.min + '–' + rp.max + ' 张（适合 ' + esc(p.suitablePeople || '—') + '）';
          else if (vol > rp.max) { var upP = sibsAll.filter(function (x) { return x.recommendPages.max >= vol && x.id !== p.id; }).sort(function (a, b) { return a.recommendPages.max - b.recommendPages.max; })[0]; msg = '建议升级' + (upP ? '到<a href="#/plan/' + mode + '/' + upP.slug + '">「' + esc(upP.name) + '」</a>' : '，可咨询客服') + '（本档推荐 ≤' + rp.max + ' 张）'; }
          else { var dn = sibsAll.filter(function (x) { return x.recommendPages.min <= vol && x.id !== p.id; }).sort(function (a, b) { return b.recommendPages.min - a.recommendPages.min; })[0]; msg = '印量较少' + (dn ? '，可选<a href="#/plan/' + mode + '/' + dn.slug + '">「' + esc(dn.name) + '」</a>' : ''); }
          $('pm-out').innerHTML = msg;
        }
      } else {
        var b = budget(it); $('calcout').innerHTML = formula(it) + ' = <b id="calc-month">' + yen(b.min) + '</b>';
        document.querySelectorAll('[data-dt]').forEach(function (x) { x.classList.toggle('on', unitPrice(p, it) === (r.dayTiers || []).filter(function (t) { return t.minDays === +x.dataset.dt; })[0].dailyFee); });
        if (mode === 'short') { var cap = r.monthlyFee && up * it.days >= r.monthlyFee; $('caphint').hidden = !cap; $('caphint').textContent = '租用 ' + it.days + ' 天已超过月租价 ' + yen(r.monthlyFee) + '，长租更划算，可咨询客服。'; }
      }
    }
    function openSheet(add) { fromAdd = !!add; $('sh-ok').textContent = add ? btn1 : '确定'; $('sel-mask').hidden = false; document.body.classList.add('dp-lock'); update(); }
    function closeSheet() { $('sel-mask').hidden = true; document.body.classList.remove('dp-lock'); }
    function doAdd() { read(); var c = JSON.parse(JSON.stringify(it)); delete c.vol; c.id = 'q' + Date.now(); addToQuote(c); }
    document.querySelectorAll('[data-months]').forEach(function (b) { b.onclick = function () { it.months = +b.dataset.months; update(); }; });
    document.querySelectorAll('[data-vol]').forEach(function (b) { b.onclick = function () { it.vol = +b.dataset.vol; update(); }; });
    document.querySelectorAll('[data-dt]').forEach(function (b) { b.onclick = function () { $('days').value = b.dataset.dt; update(); }; });
    document.querySelectorAll('[data-inc]').forEach(function (b) { b.onclick = function () { var e = $(b.dataset.inc); e.value = num(b.dataset.inc) + 1; update(); }; });
    document.querySelectorAll('[data-dec]').forEach(function (b) { b.onclick = function () { var e = $(b.dataset.dec); e.value = Math.max(1, num(b.dataset.dec) - 1); update(); }; });
    $('selector').querySelectorAll('input').forEach(function (e) { e.oninput = update; });
    $('d-sel').onclick = function () { openSheet(false); };
    $('sh-close').onclick = function () { chosen = true; closeSheet(); update(); };
    $('sel-mask').onclick = function (e) { if (e.target.id === 'sel-mask') { chosen = true; closeSheet(); update(); } };
    $('sh-ok').onclick = function () { chosen = true; closeSheet(); update(); if (fromAdd) doAdd(); else toast('已选 ' + selText()); };
    $('btn-add').onclick = function () { if (!chosen) return openSheet(true); doAdd(); };
    if ($('d-guar')) $('d-guar').onclick = function () {
      var notes = T('plan_detail.guar.notes', ''), map = {}; String(notes || '').split('\n').forEach(function (l) { var m = l.split(/[:：]/); if (m[1]) map[m[0].trim()] = m.slice(1).join('：').trim(); });
      document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet dp-gsheet" id="guar-sheet"><h3>服务保障</h3>' + hl.map(function (g) { return row(g, esc(map[g] || GUAR_NOTE[g] || GUAR_NOTE[g.replace(/\s/g, '')] || '以合同约定为准')); }).join('') + '<div class="btns"><button class="btn o" id="keep">知道了</button></div></div></div>';
      $('keep').onclick = closeModal; $('mask').onclick = function (e) { if (e.target.id === 'mask') closeModal(); };
    };
    $('btn-cs').onclick = function () {
      var show = function (o) { document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet" id="cs-sheet">' + ownerCard(o, 'cs-card') + '<div class="btns"><button class="btn o" id="keep">关闭</button></div></div></div>'; $('keep').onclick = closeModal; $('mask').onclick = function (e) { if (e.target.id === 'mask') closeModal(); }; bindOwnerIn($('cs-sheet'), o); };
      if (!loginPhone()) return show(D.salesDefault);
      loadMine().then(function (d) { show(d.owner || D.salesDefault); }, function () { show(D.salesDefault); });
    };
    if ($('specs-more')) $('specs-more').onclick = function () { document.querySelectorAll('#specs .dp-more').forEach(function (x) { x.hidden = false; }); this.remove(); };
    if ($('cases-more')) $('cases-more').onclick = function () { document.querySelectorAll('#cases .dp-more').forEach(function (x) { x.hidden = false; }); this.remove(); };
    // 吸顶 Tab：点击滚动到区域；滚动时高亮跟随
    // 页面容器有 overflow-x:hidden，CSS sticky 不生效，改为滚动到位时 position:fixed（占位元素保持高度，不跳动）
    var tabsEl = $('d-tabs'), tabsPh = $('d-tabs-ph'), navH = function () { var n = document.querySelector('.nav'); return n ? Math.max(0, n.getBoundingClientRect().bottom) : 0; };
    document.querySelectorAll('[data-dtab]').forEach(function (b) { b.onclick = function () { var s = $('sec-' + b.dataset.dtab); window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - tabsEl.offsetHeight - 4); onScroll(); }; });
    var onScroll = function () {
      if (!document.body.contains(tabsEl)) return window.removeEventListener('scroll', onScroll);
      var top = navH(), stuck = tabsPh.getBoundingClientRect().top <= top + 0.5;
      tabsEl.classList.toggle('stuck', stuck); tabsEl.style.top = stuck ? top + 'px' : '';
      var y = top + tabsEl.offsetHeight + 24, cur = 0;
      for (var i = 0; i < 4; i++) if ($('sec-' + i).getBoundingClientRect().top <= y) cur = i;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = 3;
      document.querySelectorAll('[data-dtab]').forEach(function (b) { b.classList.toggle('on', +b.dataset.dtab === cur); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    $('btn-survey').onclick = function () { sessionStorage.setItem('rental_demo_consult', JSON.stringify([defaultItem(p)])); sessionStorage.setItem('rental_demo_survey', '1'); location.hash = '#/consult?from=plan&survey=1'; };
    $('btn-fav').onclick = function () { var on = toggleFav(p); this.firstChild.textContent = on ? '★ 已收藏' : '☆ 收藏'; };
    $('btn-share').onclick = function () { showPoster(p); };
    $('btn-consult').onclick = function () { read(); var c = JSON.parse(JSON.stringify(it)); delete c.vol; sessionStorage.setItem('rental_demo_consult', JSON.stringify([c])); location.hash = '#/consult?from=plan'; };
  }
  function bindOwnerIn(root, o) {
    root.querySelectorAll('[data-copywx]').forEach(function (b) { b.onclick = function () { var t = b.dataset.copywx; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('微信号已复制：' + t); }, function () { toast('微信号：' + t); }); }; });
  }

  /* ---------- 预算弹窗 ---------- */
  function closeModal() { document.getElementById('modal').innerHTML = ''; }
  function showBudget(it) {
    var p = planById(it.planId), b = budget(it), all = totals();
    document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet" role="dialog" id="budget-modal">' +
      '<h3>' + esc(p.mode === 'expo' ? '预约' + T('budget_modal.main.title', '已加入询价单') : T('budget_modal.main.title', '已加入询价单')) + '</h3><div class="ok">✓ 询价单共 ' + qCount() + ' 项</div>' +
      '<div class="bud">本项预估预算<span class="price" id="budget-range">' + (b ? '约 ' + yen(b.min) + '–' + yen(b.max) : '需商务报价') + '</span></div>' +
      '<div class="formula">' + esc(p.name) + '<br>' + (b ? formula(it) + '，上限再加 ' + Math.round(S.budgetBufferRate * 100) + '%' : '') + '<br><span class="note">' + esc(T('budget_modal.main.note', '不含超印费 · 以商务报价为准 · 可开对公发票')) + '</span>' +
      (all.n > 1 ? '<br>询价单合计：约 ' + yen(all.min) + '–' + yen(all.max) : '') + '</div>' +
      '<div class="btns"><a class="btn a block" href="#/quote" id="go-quote">' + esc(T('budget_modal.main.go', '去询价单提交')) + '</a><div class="row2"><button class="btn o" id="keep">' + esc(T('budget_modal.main.keep', '继续逛')) + '</button><a class="btn o" href="#/consult?from=quote">直接找客服报价</a></div></div></div></div>';
    document.getElementById('keep').onclick = closeModal;
    document.getElementById('mask').onclick = function (e) { if (e.target.id === 'mask') closeModal(); };
  }
  function totals() {
    var t = { min: 0, max: 0, n: 0, unknown: 0 };
    loadQ().forEach(function (it) { if (!planById(it.planId)) return; var b = budget(it); t.n++; if (b) { t.min += b.min; t.max += b.max; } else t.unknown++; });
    return t;
  }

  /* ---------- 询价单 ---------- */
  function pageQuote() {
    var items = loadQ().filter(function (it) { return planById(it.planId); }), t = totals();
    var prof = profile();
    render(nav('询价单', true) + '<div class="modebar" data-sec="quote.main">' + esc(T('quote.main.bar', 'ℹ️ 这是询价单，无需在线付款。提交后商务人员会联系您报价，合同线下签订。')) + '</div>' +
      (items.length ? '<div class="box"><h4>询价内容（' + items.length + '）</h4>' + items.map(function (it) {
        var p = planById(it.planId), b = budget(it);
        return '<div class="qitem" data-id="' + it.id + '"><div class="pimg">' + img(p) + '</div><div style="flex:1;min-width:0"><div class="pname" style="font-size:14px">' + esc(p.name) + '</div>' +
          '<div class="meta">' + MODES[p.mode].title + ' · ' + esc(itemMeta(it)) + '</div><div class="meta">预算 ' + (b ? '<span class="price">约 ' + yen(b.min) + '–' + yen(b.max) + '</span>' : '需商务报价') + '</div>' +
          '<div class="ops"><div class="step"><button data-q="-1" aria-label="减">−</button><input value="' + it.qty + '" readonly><button data-q="1" aria-label="加">+</button></div><button class="del" data-del>删除</button></div></div></div>';
      }).join('') + '</div><div class="box total"><span>合计预估</span><span class="price" id="quote-total">约 ' + yen(t.min) + '–' + yen(t.max) + (t.unknown ? ' + 需报价项' : '') + '</span></div>' +
      '<div class="box form" id="qform"><h4>联系信息</h4>' + contactFields(prof, true) +
      '<button class="btn a block" id="submit-quote">' + esc(T('quote.main.submit', '提交询价')) + '</button><a class="btn o block" style="margin-top:10px" href="#/consult?from=quote">直接找客服报价</a></div>'
        : emptyState('quote-empty', '询价单还是空的', '去商城看看', '#/mall') + favBlock()), { tab: 'quote' });
    $app.querySelectorAll('.qitem').forEach(function (row) {
      var id = row.dataset.id;
      row.querySelectorAll('[data-q]').forEach(function (b) { b.onclick = function () { var all = loadQ(); all.forEach(function (x) { if (x.id === id) x.qty = Math.max(1, x.qty + (+b.dataset.q)); }); saveQ(all); pageQuote(); }; });
      row.querySelector('[data-del]').onclick = function () { saveQ(loadQ().filter(function (x) { return x.id !== id; })); pageQuote(); toast('已删除'); };
    });
    var sb = document.getElementById('submit-quote');
    if (sb) sb.onclick = function () { submitLead('quote', items); };
  }
  function profile() { try { return JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch (e) { return {}; } }
  function contactFields(pf, quote) {
    function fi(id, label, req, ph, type) { return '<div class="fi" id="fi-' + id + '"><label>' + label + (req ? ' <span class="req">*</span>' : '') + '</label><input class="f" id="' + id + '" ' + (type ? 'type="' + type + '" inputmode="numeric" maxlength="11" ' : '') + 'placeholder="' + ph + '" value="' + esc(pf[id] || '') + '"><div class="err"></div></div>'; }
    return '<div data-sec="quote.form"></div>' + fi('org', T('quote.form.orgLabel', '单位名称'), true, T('quote.form.orgPh', '如：某某区政务服务中心')) + fi('name', T('quote.form.nameLabel', '联系人'), true, '您的称呼') + fi('phone', T('quote.form.phoneLabel', '手机'), true, '11 位手机号', 'tel') +
      fi('wechat', '微信号（选填）', false, '填了客服加得更快') +
      (quote ? '<div class="fi"><label>开票需求</label><select class="f" id="invoice"><option>增值税专票</option><option>增值税普票</option><option>暂不需要</option></select></div>' : '') +
      '<div class="fi"><label>备注</label><textarea class="f" id="msg" rows="2" placeholder="选填，如：需要合同模板、报价单 PDF"></textarea></div>' +
      '<label class="check"><input type="checkbox" id="consent">我已阅读并同意<a href="#/privacy" style="color:var(--pri)">《个人信息处理说明》</a></label>';
  }
  function validate() {
    var ok = true;
    function bad(id, m) { var f = document.getElementById('fi-' + id); f.classList.toggle('bad', !!m); f.querySelector('.err').textContent = m || ''; if (m) ok = false; }
    var org = document.getElementById('org').value.trim(), name = document.getElementById('name').value.trim(), ph = document.getElementById('phone').value.trim();
    bad('org', org ? '' : '请填写单位名称'); bad('name', name ? '' : '请填写联系人');
    bad('phone', !ph ? '请填写手机号' : /^1[3-9]\d{9}$/.test(ph) ? '' : '手机号格式不正确（11 位，1 开头）');
    if (ok && !document.getElementById('consent').checked) { toast('请先勾选同意《个人信息处理说明》'); ok = false; }
    if (!ok) { toast('请检查必填项'); return null; }
    var pf = { org: org, name: name, phone: ph, wechat: document.getElementById('wechat').value.trim() };
    localStorage.setItem(PKEY, JSON.stringify(pf)); return pf;
  }
  var submitting = false;
  var ALL_TMPLS = [['status', '订单状态通知'], ['quote', '报价通知'], ['assign', '客服分配通知']];
  /* E1 模拟 wx.requestSubscribeMessage：用户点「提交」时弹出；拒绝也照样提交 */
  function askSubscribe(cb, allowAlways) {
    var keep = localStorage.getItem(SUBKEY);
    if (allowAlways !== false && keep === 'allow') return cb(ALL_TMPLS.map(function (t) { return t[0]; }));
    if (allowAlways !== false && keep === 'deny') return cb([]);
    document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet" id="sub-sheet"><h3>「' + esc(S.company.short) + '」申请发送以下消息</h3>' +
      ALL_TMPLS.map(function (t) { return '<label class="check sub-row"><input type="checkbox" data-tmpl="' + t[0] + '" checked> ' + t[1] + '</label>'; }).join('') +
      (allowAlways === false ? '' : '<label class="check note"><input type="checkbox" id="sub-always"> 总是保持以上选择，不再询问</label>') +
      '<p class="note">演示版：模拟微信「订阅消息」弹窗，不会真的调用微信；进展更新时会出现在「我的 → ⚙ → 服务通知」</p>' +
      '<div class="btns row2"><button class="btn o" id="sub-deny">拒绝</button><button class="btn a" id="sub-allow">允许</button></div></div></div>';
    function fin(allow) {
      var list = allow ? Array.prototype.slice.call(document.querySelectorAll('#sub-sheet [data-tmpl]:checked')).map(function (x) { return x.dataset.tmpl; }) : [];
      var al = document.getElementById('sub-always'); if (al && al.checked) localStorage.setItem(SUBKEY, allow ? 'allow' : 'deny');
      closeModal(); cb(list);
    }
    document.getElementById('sub-allow').onclick = function () { fin(true); };
    document.getElementById('sub-deny').onclick = function () { fin(false); };
  }
  function submitLead(type, items, sub) {
    var pf = validate(); if (!pf || submitting) return;
    if (!loginPhone()) return showLoginSheet(function () { submitLead(type, items); }); // 新规则：提交前必须微信登录，登录后自动继续提交
    if (sub === undefined) return askSubscribe(function (list) { submitLead(type, items, list); });
    var ref = sceneVal('ref'), chn = sceneVal('channel'), rep0 = (items.filter(function (i) { return i.fromOrder; })[0] || {}).fromOrder || '';
    function done(no) {
      sessionStorage.setItem('rental_demo_done', JSON.stringify({ no: no, type: type, n: items.length }));
      if (type === 'quote') saveQ([]);
      location.hash = '#/done?type=' + type;
    }
    if (!ONLINE) { // 双击打开的离线演示：只模拟提交；同时记到本机，「我的」里按手机号显示（状态：已提交）
      var no = (type === 'quote' ? 'XJ' : 'KF') + new Date().toISOString().slice(2, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 9000) + 1000);
      var mine = []; try { mine = JSON.parse(localStorage.getItem(MYKEY) || '[]'); } catch (e) {}
      var refRep = (D.salesContacts || []).filter(function (x) { return x.id === ref && x.enabled !== false; })[0];
      mine.push({ code: no, type: type, phone: loginPhone(), formPhone: pf.phone, contact: { org: pf.org, name: pf.name, phone: pf.phone }, items: items, assigneeId: refRep ? refRep.id : '', channelId: chn, subscribe: sub, repeatOf: rep0, createdAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19) });
      localStorage.setItem(MYKEY, JSON.stringify(mine));
      return done(no);
    }
    if (false) {
      return done((type === 'quote' ? 'XJ' : 'KF') + new Date().toISOString().slice(2, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 9000) + 1000));
    }
    var inv = document.getElementById('invoice'), msg = document.getElementById('msg');
    submitting = true; busyBtn(true);
    fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      type: type, items: items, consent: true, consentVersion: T('privacy.main.version', ''), sourcePage: location.hash,
      contact: { org: pf.org, name: pf.name, phone: pf.phone, wechat: pf.wechat }, invoice: inv ? inv.value : '', message: msg ? msg.value : '',
      subscribe: sub, refSalesId: ref, channelId: chn, repeatOf: rep0, filters: /from=filter/.test(location.hash) ? (function () { try { return JSON.parse(sessionStorage.getItem('rental_demo_filters') || 'null'); } catch (e) { return null; } })() : null
    }) }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (x) {
        submitting = false; busyBtn(false);
        if (x.ok) return done(x.j.code);
        if (x.status === 401) { localStorage.removeItem(LKEY); return showLoginSheet(function () { submitLead(type, items, sub); }); } // 登录过期
        toast(x.j.error || '提交失败');
      })
      .catch(function () { submitting = false; busyBtn(false); toast('网络异常，请稍后再试或直接添加客服'); });
  }

  /* ---------- 找客服报价 ---------- */
  function pageConsult(q) {
    var items = [];
    if (q.from === 'plan') { try { items = JSON.parse(sessionStorage.getItem('rental_demo_consult') || '[]'); } catch (e) {} }
    else if (q.from === 'quote') items = loadQ();
    items = items.filter(function (it) { return planById(it.planId); });
    render(nav('找客服报价', true) + '<div class="modebar" data-sec="consult.main">' + esc(T('consult.main.bar', '💬 留下联系方式，微信客服会主动添加您并报价')) + '</div>' +
      (items.length ? '<div class="box" id="prefill"><h4>咨询内容（已预填）</h4>' + items.map(function (it) { var p = planById(it.planId); return '<div class="qitem"><div class="pimg">' + img(p) + '</div><div><div class="pname" style="font-size:14px">' + esc(p.name) + '</div><div class="meta">' + MODES[p.mode].title + ' · ' + esc(itemMeta(it)) + '</div></div></div>'; }).join('') + '</div>' : '') +
      '<div class="box form"><h4>您的联系方式</h4>' + contactFields(profile(), false) + '<button class="btn a block" id="submit-consult">' + esc(T('consult.main.submit', '提交，等客服添加我')) + '</button></div>' +
      '<div class="box" style="text-align:center"><div class="note">' + esc(T('consult.main.direct', '不想留资料？直接添加客服微信')) + '</div><button class="small-btn" style="margin-top:8px" id="show-qr">显示客服二维码</button><div id="qrbox"></div></div>', { tab: '' });
    if (q.from === 'filter') { var ff = {}; try { ff = JSON.parse(sessionStorage.getItem('rental_demo_filters') || '{}'); } catch (e) {} // F8 空结果带条件来
      if (ff.text) { var m1 = document.getElementById('msg'); if (m1) m1.value = '我的筛选条件（' + ff.text + '），没有完全符合的套餐，请帮我定制报价'; document.querySelector('.modebar').insertAdjacentHTML('afterend', '<div class="box f-pre" id="filter-prefill"><h4>已带上筛选条件</h4><p>' + esc(ff.text) + '</p></div>'); } }
    if (q.survey) { var m0 = document.getElementById('msg'); if (m0) m0.value = '预约免费上门勘测'; document.querySelector('.modebar').textContent = '🔧 预约免费上门勘测：留下联系方式，商务会联系您约时间'; }
    document.getElementById('submit-consult').onclick = function () { submitLead('consult', items); };
    document.getElementById('show-qr').onclick = function () { document.getElementById('qrbox').innerHTML = qr() + '<div class="note">微信号：' + esc(S.company.wechat) + '</div>'; };
  }
  function qr() { // 后台素材库选了二维码就用它，否则用占位二维码（固定图案，不可扫描）
    var qimg = T('done.qr.image', '');
    if (qimg) return '<div class="qr" data-sec="done.qr"><img id="qr-img" src="' + esc(qimg) + '" alt="客服二维码" style="width:100%;height:100%;object-fit:contain"></div><div class="note">长按识别二维码添加客服</div>';
    var s = '', n = 21, seed = 7;
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var f = function (a, b) { return x >= a && x < a + 7 && y >= b && y < b + 7; };
      var on;
      if (f(0, 0) || f(14, 0) || f(0, 14)) { var dx = x % 14 < 7 ? x % 14 : x, dy = y % 14 < 7 ? y % 14 : y; dx = x >= 14 ? x - 14 : x; dy = y >= 14 ? y - 14 : y; on = dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5); }
      else { seed = (seed * 9301 + 49297) % 233280; on = seed / 233280 > 0.55; }
      if (on) s += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    return '<div class="qr"><svg viewBox="0 0 21 21" width="100%" height="100%" shape-rendering="crispEdges">' + s + '</svg></div><div class="note">客服二维码（演示占位）</div>';
  }

  function busyBtn(on) { // D'.12-8 提交中禁用，防重复点击
    var b = document.getElementById('submit-quote') || document.getElementById('submit-consult'); if (!b) return;
    if (on) { b.dataset.t = b.textContent; b.textContent = '提交中…'; b.disabled = true; } else if (b.dataset.t) { b.textContent = b.dataset.t; b.disabled = false; }
  }
  function pageDone(q) {
    var d = {}; try { d = JSON.parse(sessionStorage.getItem('rental_demo_done') || '{}'); } catch (e) {}
    render(nav('提交成功', false) + '<div class="box done"><div class="ck">✓</div><div class="done-h" id="done-title">提交成功</div><h2 data-sec="done.main">' + esc(q.type === 'quote' ? T('done.main.titleQuote', '询价已提交') : T('done.main.titleConsult', '资料已提交')) + '</h2>' +
      '<div class="no">编号：<b id="lead-no">' + esc(d.no || '演示编号') + '</b></div>' +
      '<p style="margin-top:12px;font-size:16px;font-weight:600;color:var(--pri)" id="done-add">' + esc(T('done.main.add', '客服将主动添加您')) + '</p><p class="note">' + esc(T('done.main.sub', '工作时间内 {h} 小时内添加，请留意微信好友申请').replace('{h}', S.replySlaHours)) + '</p>' +
      '</div>' + ownerCard(D.salesDefault, 'done-rep') + '<div class="box done">' + qr() + '<p class="note">想更快？也可以直接扫码添加客服</p></div>' +
      '<div class="box"><div class="kv"><span>客服微信号</span><span>' + esc(S.company.wechat) + ' <button class="small-btn" id="copy">复制</button></span></div>' +
      '<div class="kv"><span>业务电话</span><a class="small-btn" style="display:flex;align-items:center" href="tel:' + esc(S.company.phone) + '">' + esc(S.company.phone) + '</a></div></div>' +
      '<div style="padding:0 12px"><a class="btn p block" href="#/mall">返回商城</a></div><p class="note" style="text-align:center;margin-top:10px">' + (ONLINE ? '测试环境：信息已提交到本地测试后台' : '演示版：提交为模拟，不会真正发送') + '</p>', { tab: '' });
    bindOwner(D.salesDefault);
    document.getElementById('copy').onclick = function () {
      var t = S.company.wechat;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('微信号已复制'); }, function () { toast('微信号：' + t); });
    };
  }

  function pageGuide() {
    var steps = T('guide.steps.items', ['在线询价或找客服报价', '商务出具正式报价单（可用于内部审批）', '签订租赁合同、盖章', '送货上门安装调试', '按月对账结算，开具对公发票', '到期续租或上门回收']);
    render(nav('对公采购流程', true) + '<div class="box guide" data-sec="guide.steps"><h4>流程</h4><ol>' + steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div>' +
      '<div class="box guide" data-sec="guide.price"><h4>价格说明</h4><p class="note" style="font-size:13px;line-height:1.7">' + esc(T('guide.price.text', '页面价格为参考价，最终以商务报价和合同为准。超出含印量部分按张计费。')) + '</p></div>' +
      '<div class="box guide" data-sec="guide.about"><h4>关于我们</h4><p class="note" style="font-size:13px;line-height:1.7">' + esc(T('guide.about.text', S.company.name + '，专注政企办公设备租赁。')) + '</p></div>' +
      purchaseBlocks() +
      '<div style="padding:0 12px"><a class="btn a block" href="#/mall">进入租赁设备商城</a></div>', { tab: '' });
  }
  function purchaseBlocks() {
    var P = D.purchase || {}, DCa = (D.detailCommon || {}).serviceAreas || [];
    return '<div class="box" id="files"><h4>对公采购材料下载 <span class="ex">示例</span></h4>' + (P.files || []).map(function (f) { return '<a class="dl" href="' + esc(f.file) + '" download>📄 ' + esc(f.name) + '<span>下载</span></a>'; }).join('') + '<div class="note">占位文件，正式版由客户提供；不含发票相关内容</div></div>' +
      '<div class="box" id="response"><h4>响应时效承诺 <span class="tbc">待客户确认</span></h4><p class="note" style="font-size:13px">' + esc(P.response || '') + '</p></div>' +
      '<div class="box" id="coverage"><h4>服务覆盖区域 <span class="ex">示例</span></h4><div class="tags">' + (DCa.length ? DCa.map(function (x) { return '<span>' + esc(x.area) + '</span>'; }) : (P.areas || []).map(function (x) { return '<span>' + esc(x) + '</span>'; })).join('') + '</div></div>' +
      '<div class="box" id="logos"><h4>合作客户 <span class="ex">占位，需授权</span></h4><div class="logos">' + (P.logos || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div>';
  }

  /* ---------- C1 推荐套餐 ---------- */
  function pageRecommend() {
    var RC = D.recommend || { questions: [], rules: [] }, ans = pageRecommend.ans || (pageRecommend.ans = {});
    var done = RC.questions.every(function (q) { return ans[q.key]; }), res = '';
    if (done) {
      var rule = RC.rules.filter(function (r) { return Object.keys(r.when).every(function (k) { return ans[k] === r.when[k]; }); })[0];
      var pick = function (slug, lab) { var pl = plans('long').filter(function (x) { return x.slug === slug; })[0]; if (!pl) return '';
        return '<div class="pcard reco" data-slug="' + slug + '"><div class="pimg">' + img(pl) + '</div><div class="pinfo"><span class="note">' + lab + '</span><div class="pname">' + esc(pl.name) + '</div><div class="price">' + priceHTML(pl) + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:6px"><button class="small-btn" data-radd="' + pl.id + '">加入询价单</button><a class="small-btn" style="display:inline-flex;align-items:center" href="#/plan/long/' + slug + '">看详情</a></div></div></div>'; };
      res = '<div class="box" id="reco-result"><h4>为您推荐</h4>' + pick(rule.main, '主推') + pick(rule.alt, '备选') + '<a class="btn p block" href="#/consult" style="margin-top:8px">拿不准？直接找客服</a><button class="small-btn" id="reco-reset" style="margin-top:8px">重新选择</button></div>';
    }
    render(nav('推荐套餐', true) + '<div class="modebar">回答 3 个问题，帮您挑选合适的套餐（规则可在后台配置）</div>' + RC.questions.map(function (q, i) {
      return '<div class="box" data-q="' + q.key + '"><h4>' + (i + 1) + '. ' + esc(q.q) + '</h4><div class="opts" style="justify-content:flex-start">' + q.options.map(function (o) { return '<button class="opt ' + (ans[q.key] === o[0] ? 'on' : '') + '" data-a="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div></div>';
    }).join('') + res, { tab: 'mall' });
    $app.querySelectorAll('[data-q] [data-a]').forEach(function (b) { b.onclick = function () { ans[b.closest('[data-q]').dataset.q] = b.dataset.a; pageRecommend(); }; });
    $app.querySelectorAll('[data-radd]').forEach(function (b) { b.onclick = function () { addToQuote(defaultItem(planById(b.dataset.radd))); }; });
    var rr = document.getElementById('reco-reset'); if (rr) rr.onclick = function () { pageRecommend.ans = {}; pageRecommend(); };
  }

  /* ---------- A1 登录（演示：手机号 + 验证码 1234） ---------- */
  function loginPhone() { return localStorage.getItem(LKEY) || ''; }
  function pageLogin() {
    render(nav('手机号登录', true) + '<div class="box form" style="margin-top:16px"><h4>手机号登录 <span class="ex">演示版</span></h4>' +
      '<div class="fi" id="fi-lphone"><label>手机号</label><input class="f" id="lphone" type="tel" maxlength="11" inputmode="numeric" placeholder="11 位手机号"><div class="err"></div></div>' +
      '<div class="fi" id="fi-lcode"><label>验证码</label><div style="display:flex;gap:8px"><input class="f" id="lcode" inputmode="numeric" maxlength="4" placeholder="演示版固定 1234"><button class="small-btn" id="sendcode" style="height:44px;flex:none">获取验证码</button></div><div class="err"></div></div>' +
      '<button class="btn block wx" id="wx-login-page" style="margin-bottom:10px">💬 微信一键登录</button><p class="note" style="text-align:center;margin-bottom:10px">或用手机号 + 验证码登录</p>' +
      '<button class="btn a block" id="do-login">登录</button><p class="note" style="margin-top:10px">演示版：验证码固定为 1234，不会真的发短信。正式版改为微信手机号一键登录。演示账号：13800000000</p></div>', { tab: 'mine' });
    document.getElementById('wx-login-page').onclick = function () { doLogin({ wechat: true }, '13800000000', function () { location.hash = '#/mine'; }); };
    document.getElementById('sendcode').onclick = function () { toast('演示版验证码：1234'); };
    document.getElementById('do-login').onclick = function () {
      var ph = document.getElementById('lphone').value.trim(), code = document.getElementById('lcode').value.trim();
      var f1 = document.getElementById('fi-lphone'), f2 = document.getElementById('fi-lcode');
      var e1 = /^1[3-9]\d{9}$/.test(ph) ? '' : '手机号格式不正确（11 位，1 开头）', e2 = code === '1234' ? '' : '验证码不正确（演示版为 1234）';
      f1.classList.toggle('bad', !!e1); f1.querySelector('.err').textContent = e1; f2.classList.toggle('bad', !!e2); f2.querySelector('.err').textContent = e2;
      if (e1 || e2) return;
      var ok = function () { localStorage.setItem(LKEY, ph); toast('登录成功'); syncFavs().then(function () { location.hash = '#/mine'; }); };
      if (!ONLINE) return ok();
      fetch('/api/customer/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: ph, code: code }) })
        .then(function (r) { return r.json().then(function (j) { if (r.ok) ok(); else toast(j.error); }); });
    };
  }
  /* 提交前的登录面板：主按钮「微信一键登录」（演示：直接登录 13800000000），次选手机号 + 1234 */
  function doLogin(body, ph, then) {
    var fin = function () { localStorage.setItem(LKEY, ph); closeModal(); toast('登录成功'); syncFavs(); then(); };
    if (!ONLINE) return fin();
    fetch('/api/customer/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (r.ok) { ph = j.phone || ph; fin(); } else toast(j.error || '登录失败'); }); })
      .catch(function () { toast('网络异常，请稍后再试'); });
  }
  function showLoginSheet(then) {
    document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet" id="login-sheet"><h3>登录后提交</h3>' +
      '<p class="note" style="margin-bottom:12px">提交询价需要先登录，方便您在「我的」里查看进度。填写的内容已保留，登录后自动提交。</p>' +
      '<button class="btn block wx" id="wx-login">💬 微信一键登录</button>' +
      '<p class="note" style="margin:6px 0 12px;text-align:center">演示版：点一下即登录演示账号 138****0000，不会真的调用微信</p>' +
      '<details id="phone-login"><summary class="note" style="min-height:44px;display:flex;align-items:center">用手机号 + 验证码登录</summary>' +
      '<div class="fi" id="fi-sphone"><input class="f" id="sphone" type="tel" maxlength="11" inputmode="numeric" placeholder="11 位手机号"><div class="err"></div></div>' +
      '<div class="fi"><input class="f" id="scode" inputmode="numeric" maxlength="4" placeholder="验证码（演示版固定 1234）"><div class="err" id="scode-err"></div></div>' +
      '<button class="btn a block" id="sphone-login">登录并提交</button></details>' +
      '<div class="btns" style="margin-top:10px"><button class="btn o" id="keep">取消</button></div></div></div>';
    document.getElementById('keep').onclick = closeModal;
    document.getElementById('mask').onclick = function (e) { if (e.target.id === 'mask') closeModal(); };
    document.getElementById('wx-login').onclick = function () { doLogin({ wechat: true }, '13800000000', then); };
    document.getElementById('sphone-login').onclick = function () {
      var ph = document.getElementById('sphone').value.trim(), code = document.getElementById('scode').value.trim();
      if (!/^1[3-9]\d{9}$/.test(ph)) { document.querySelector('#fi-sphone .err').textContent = '手机号格式不正确'; return; }
      if (code !== '1234') { document.getElementById('scode-err').textContent = '验证码不正确（演示版为 1234）'; return; }
      doLogin({ phone: ph, code: code }, ph, then);
    };
  }
  function logout() { localStorage.removeItem(LKEY); if (ONLINE) fetch('/api/customer/logout', { method: 'POST' }); toast('已退出登录'); pageMine(); }
  function mask(ph) { return ph ? ph.slice(0, 3) + '****' + ph.slice(-4) : ''; }

  /* 离线（双击打开）时的数据：data.js 的演示账号 + 本机提交的询价单 */
  function offlineData(phone) {
    var acc = D.demoAccount || {}, out = { phone: mask(phone), name: '', org: '', owner: null, orders: [] };
    function repOf(o) { var r = (D.salesContacts || []).filter(function (x) { return o && o.assigneeId && x.id === o.assigneeId; })[0]; return r ? Object.assign({}, r, { assigned: true }) : Object.assign({}, D.salesDefault || {}, { assigned: false }); }
    function conv(o, code, local) {
      var items = (o.items || []).filter(function (it) { return planById(it.planId); }).map(function (it) {
        var pl = planById(it.planId), c = Object.assign({ mode: pl.mode, qty: 1 }, it); if (pl.mode === 'long') c.months = c.months || 12; else c.days = c.days || 1;
        var b = budget(c) || {}; return Object.assign(c, { unitPrice: unitPrice(pl, c), budgetMin: b.min, budgetMax: b.max, plan: { name: pl.name, tier: pl.tier, mode: pl.mode } });
      });
      var st = local ? 'new' : o.status, S0 = window.ORDER_STATUS[st];
      return { code: code, type: o.type || 'quote', typeName: (o.type === 'consult' ? '找客服' : '询价单'), status: st, statusName: S0.customer, statusDesc: S0.desc, createdAt: o.createdAt,
        summary: items.map(function (i) { return i.plan.name + ' ×' + i.qty + (i.months ? '·' + i.months + ' 个月' : '·' + i.days + ' 天'); }).join('；'),
        budgetMin: items.reduce(function (a, i) { return a + (i.budgetMin || 0); }, 0), budgetMax: items.reduce(function (a, i) { return a + (i.budgetMax || 0); }, 0),
        stepDates: o.stepDates || { new: (o.createdAt || '').slice(0, 10) }, owner: repOf(o).name, assigned: repOf(o).assigned, rep: repOf(o), quote: offlineQuote(o, code), repeat: !!o.repeatOf, offItems: (o.items || []).length - items.length, wonAmount: o.wonAmount || null, items: items,
        contact: { org: (o.contact || acc.contact || {}).org, name: (o.contact || acc.contact || {}).name, phone: mask(phone) },
        follows: (o.follows || []).filter(function (f) { return f.visible; }).map(function (f) { return { at: f.at, by: f.by || '李经理', text: f.customerText || f.text }; }).reverse() };
    }
    if (lsGet(DELKEY, []).indexOf(phone) >= 0) return out; // E12 离线：已申请删除个人信息
    if (phone === acc.phone) { out.name = acc.contact.name; out.org = acc.contact.org; (acc.orders || []).forEach(function (o, i) { out.orders.push(conv(o, 'T' + o.createdAt.slice(0, 10).replace(/-/g, '') + '-' + ('000' + (i + 1)).slice(-4), false)); }); }
    var mine = []; try { mine = JSON.parse(localStorage.getItem(MYKEY) || '[]'); } catch (e) {}
    mine.filter(function (o) { return o.phone === phone; }).forEach(function (o) { out.orders.push(conv(o, o.code, true)); if (!out.name) { out.name = o.contact.name; out.org = o.contact.org; } });
    out.orders.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
    out.owner = out.orders[0] ? out.orders[0].rep : repOf(null); // 「我的」名片 = 最近一张订单的负责客服
    return out;
  }
  function offlineQuote(o, code) {
    if (!o.quote) return null;
    var q = JSON.parse(JSON.stringify(o.quote)), a = lsGet(QAKEY, {})[code];
    if (a) { q.customerAction = a.action; q.actionAt = a.at; }
    q.expired = q.validUntil < today(0); return q;
  }
  function loadMine() {
    var ph = loginPhone();
    if (!ONLINE) return Promise.resolve(offlineData(ph));
    return fetch('/api/customer/me', { credentials: 'same-origin' }).then(function (r) { if (r.status === 401) { localStorage.removeItem(LKEY); throw 401; } return r.json(); });
  }
  function ownerCard(o, id) {
    o = o || {};
    return '<div class="box owner" id="' + (id || 'owner-card') + '" data-rep="' + esc(o.id || '') + '"><div class="ow-h"><span class="av">' + (o.avatar ? '<img src="' + esc(o.avatar) + '">' : esc((o.name || '客').slice(0, 1))) + '</span><div><b>' + (o.assigned ? '负责客服' : '默认客服') + '：<span class="rep-name">' + esc(o.name || '一龙客服') + '</span></b>（' + esc(o.title || '客服') + '）<div class="note">' + esc(o.response || '工作时间内尽快回复') + '</div></div>' +
      (o.qr ? '<img class="ow-qr" src="' + esc(o.qr) + '" alt="二维码" data-qr>' : '') + '</div>' +
      (o.assigned ? '' : '<div class="note ow-wait">客服分配中，您可先联系</div>') +
      '<div class="ow-kv"><span>电话 <b class="rep-phone">' + esc(o.phone || S.company.phone) + '</b></span><span>微信号 <b class="rep-wx">' + esc(o.wechat || S.company.wechat) + '</b></span></div>' +
      '<div class="ow-b"><button class="small-btn" data-copywx="' + esc(o.wechat || S.company.wechat) + '">复制微信</button><a class="small-btn" style="display:inline-flex;align-items:center" href="tel:' + esc(o.phone || S.company.phone) + '">拨打电话</a><button class="small-btn" data-qr>看二维码</button></div></div>';
  }
  function bindOwner(o) {
    $app.querySelectorAll('[data-copywx]').forEach(function (b) { b.onclick = function () { var t = b.dataset.copywx; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('微信号已复制：' + t); }, function () { toast('微信号：' + t); }); }; });
    $app.querySelectorAll('[data-qr]').forEach(function (b) { b.onclick = function () { showOwner(o, true); }; });
  }
  function showOwner(o, qrOnly) {
    document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet" id="owner-sheet"><h3>' + esc((o && o.name) || '一龙客服') + '</h3>' +
      ((o && o.qr) ? '<div class="qr"><img src="' + esc(o.qr) + '" style="width:100%;height:100%;object-fit:contain"></div>' : qr()) +
      '<div class="kv"><span>微信号</span><span>' + esc((o && o.wechat) || S.company.wechat) + '</span></div><div class="kv"><span>电话</span><a href="tel:' + esc((o && o.phone) || S.company.phone) + '">' + esc((o && o.phone) || S.company.phone) + '</a></div>' +
      '<div class="btns"><button class="btn o" id="keep">关闭</button></div></div></div>';
    document.getElementById('keep').onclick = closeModal;
    document.getElementById('mask').onclick = function (e) { if (e.target.id === 'mask') closeModal(); };
  }

  /* ---------- A2/A3 「我的」 ---------- */
  var mineTab = 'all';
  function pageMine() {
    var ph = loginPhone();
    if (!ph) {
      render(nav('我的', false) + '<div class="box mine-h" style="text-align:center;padding:24px"><div class="av big">👤</div><p style="margin:10px 0">登录后查看订单和专属商务</p><a class="btn a" href="#/login" id="go-login">手机号登录</a></div>' + ownerCard(D.salesDefault, 'owner-card') + mineFoot(), { tab: 'mine' });
      return bindOwner(D.salesDefault);
    }
    render(nav('我的', false) + skeleton('mine'), { tab: 'mine' });
    var h0 = location.hash;
    loadMine().then(function (d) {
      if (location.hash !== h0) return; // 已离开本页：慢请求回来后不覆盖当前页面
      var tabs = window.ORDER_STEPS_CONFIG.customerTabs, tab = tabs.filter(function (t) { return t.key === mineTab; })[0] || tabs[0];
      var list = d.orders.filter(function (o) { return !tab.statuses.length || tab.statuses.indexOf(o.status) >= 0; });
      render(nav('我的', false) + '<div class="box mine-h" id="mine-head"><div><b id="mine-name">' + esc(d.name || '客户') + (d.org ? ' · ' + esc(d.org) : '') + '</b><div class="note" id="mine-phone">' + esc(d.phone) + '</div></div><div><a class="small-btn gear" id="mine-gear" href="#/settings" aria-label="设置">⚙</a> <button class="small-btn" id="logout">退出登录</button></div></div>' +
        ownerCard(d.owner) +
        '<div class="box" style="padding-bottom:6px"><h4>订单大全</h4><div class="filters mtabs" style="padding:0">' + tabs.map(function (t) {
          var n = d.orders.filter(function (o) { return !t.statuses.length || t.statuses.indexOf(o.status) >= 0; }).length;
          return '<button class="chip ' + (t.key === tab.key ? 'on' : '') + '" data-mt="' + t.key + '">' + t.label + (n ? ' ' + n : '') + '</button>'; }).join('') + '</div></div>' +
        '<div id="my-orders">' + (list.length ? list.map(function (o) {
          var S0 = window.ORDER_STATUS[o.status];
          return '<a class="box ocard" href="#/order/' + o.code + '" data-code="' + o.code + '"><div class="oc-h"><b>' + o.code + '</b><span class="stag" style="background:' + S0.color + '">' + esc(o.statusName) + '</span></div>' +
            '<div class="oc-s">' + esc(o.summary || '（找客服咨询）') + '</div><div class="oc-m">' + (o.wonAmount ? '成交 <b class="price">' + yen(o.wonAmount) + '</b>' : '预估 ' + yen(o.budgetMin) + '–' + yen(o.budgetMax)) + ' · 商务 ' + esc(o.owner || '') + '</div>' +
            '<div class="oc-f"><span class="note">' + esc((o.createdAt || '').replace('T', ' ').slice(5, 16)) + ' 提交</span><span><button class="small-btn" data-again="' + o.code + '">再来一单</button> <span class="note">详情 ›</span></span></div></a>';
        }).join('') : emptyState('mine-empty', '还没有订单', '去商城看看', '#/mall')) + '</div>' + mineFoot(), { tab: 'mine' });
      document.getElementById('logout').onclick = logout;
      $app.querySelectorAll('[data-mt]').forEach(function (b) { b.onclick = function () { mineTab = b.dataset.mt; pageMine(); }; });
      $app.querySelectorAll('[data-again]').forEach(function (b) { b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); loadOrder(b.dataset.again).then(function (x) { againOrder(x.order); }); }; });
      bindOwner(d.owner);
    }).catch(function () { pageMine(); });
  }
  function mineFoot() { return '<div class="mine-foot"><a href="#/guide">常见问题</a> · <a href="#/privacy">隐私条款</a> · <a href="#/guide">关于我们</a></div>'; }

  /* ---------- A4 订单详情 ---------- */
  function pageOrderDetail(code) {
    if (!loginPhone()) { location.hash = '#/login'; return; }
    if (!document.getElementById('od-code')) render(nav('订单详情', true) + skeleton('detail'), { tab: 'mine' }); // D'.12-2 骨架屏
    var h1 = location.hash;
    loadOrder(code).then(function (d) {
      if (location.hash !== h1) return;
      var o = d.order, S0 = window.ORDER_STATUS[o.status], closed = o.status === 'invalid', cur = S0.index;
      var bar = closed ? '<div class="closed" id="order-closed">订单已关闭</div>' : '<div class="stepbar" id="stepbar">' + window.ORDER_STEPS.map(function (st, i) {
        var cls = i < cur ? 'done' : i === cur ? 'cur' : '';
        return '<div class="st ' + cls + '" data-step="' + st.key + '"><i>' + (i < cur ? '✓' : i === cur ? '●' : '○') + '</i><b>' + esc(st.customer) + '</b><span>' + esc(((o.stepDates || {})[st.key] || '').slice(5)) + '</span></div>';
      }).join('') + '</div>';
      var items = (o.items || []).map(function (it) {
        var e = it.expo || {};
        return '<div class="oi"><b>' + esc(it.plan.name) + '</b>（' + TIER[it.plan.tier] + '·' + MODES[it.plan.mode].title + '）<div class="note">数量 ' + it.qty + ' 台 · ' + (it.months ? '租期 ' + it.months + ' 个月' : (it.startDate ? it.startDate + ' 起 ' : '') + it.days + ' 天') +
          (it.unitPrice ? ' · ' + yen(it.unitPrice) + (it.plan.mode === 'long' ? '/月/台' : '/天/台') : '') + (e.name || e.venue ? ' · ' + esc([e.name, e.venue].filter(Boolean).join(' / ')) : '') + '</div></div>';
      }).join('');
      render(nav('订单详情', true) + '<div class="box st-head" style="border-left:4px solid ' + S0.color + '"><b id="od-status">' + esc(o.statusName) + '</b><div class="note">' + esc(o.statusDesc) + '</div></div>' +
        '<div class="box"><h4>订单进程</h4>' + bar + '<button class="small-btn" id="od-sub" style="margin-top:8px">🔔 有新进展时提醒我</button></div>' + quoteBlock(o) + ownerCard(d.owner, 'od-rep') +
        '<div class="box"><h4>订单信息</h4><div class="kv"><span>订单号</span><span id="od-code">' + o.code + ' <button class="small-btn" id="cp-code">复制</button></span></div>' +
        '<div class="kv"><span>提交时间</span><span>' + esc((o.createdAt || '').replace('T', ' ').slice(0, 16)) + '</span></div><div class="kv"><span>来源</span><span>' + esc(o.typeName) + '</span></div>' +
        '<div class="kv"><span>联系人</span><span>' + esc((o.contact || {}).name) + ' · ' + esc((o.contact || {}).org) + '</span></div><div class="kv"><span>手机</span><span>' + esc((o.contact || {}).phone) + '</span></div></div>' +
        '<div class="box"><h4>需求明细</h4>' + (items || '<div class="note">（找客服咨询，暂无条目）</div>') + '</div>' +
        '<div class="box"><h4>金额</h4><div>预估 ' + yen(o.budgetMin) + '–' + yen(o.budgetMax) + '（提交时）</div>' + (o.wonAmount ? '<div>成交金额 <b class="price" id="od-won">' + yen(o.wonAmount) + '</b> · 以合同为准</div>' : '<div class="note">成交后显示成交金额 · 以合同为准</div>') + '</div>' +
        '<div class="box"><h4>跟进记录</h4><ul class="fl" id="follows">' + ((o.follows || []).map(function (f) { return '<li><span class="note">' + esc(f.at.replace('T', ' ').slice(5, 16)) + ' ' + esc(f.by) + '</span><div>' + esc(f.text) + '</div></li>'; }).join('') || '<li class="note">暂无</li>') +
        '<li><span class="note">' + esc((o.createdAt || '').replace('T', ' ').slice(5, 16)) + '</span><div>订单已提交</div></li></ul></div>' +
        '<div class="actbar"><button class="btn o" id="od-owner">联系商务</button><button class="btn a" id="od-again">再来一单</button></div>', { tab: 'mine', bar: true });
      document.getElementById('cp-code').onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(o.code) : Promise.reject()).then(function () { toast('已复制订单号'); }, function () { toast(o.code); }); };
      document.getElementById('od-owner').onclick = function () { showOwner(d.owner); };
      bindOwner(d.owner);
      document.getElementById('od-again').onclick = function () { againOrder(o); };
      document.getElementById('od-sub').onclick = function () {
        askSubscribe(function (list) {
          if (!list.length) return toast('已取消订阅');
          if (!ONLINE) return toast('离线演示：已模拟订阅 ' + list.length + ' 条通知');
          fetch('/api/customer/orders/' + encodeURIComponent(o.code) + '/subscribe', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tmpls: list }) })
            .then(function (r) { toast(r.ok ? '已订阅，有新进展会通过微信服务通知提醒您' : '订阅失败'); });
        }, false);
      };
      $app.querySelectorAll('[data-qa]').forEach(function (b) { b.onclick = function () { quoteAction(o, b.dataset.qa); }; });
    }).catch(function () { render(nav('订单详情', true) + '<div class="empty">没有找到这张订单<br><a class="btn p" href="#/mine">返回我的</a></div>', { tab: 'mine' }); });
  }
  function loadOrder(code) {
    return ONLINE ? fetch('/api/customer/orders/' + encodeURIComponent(code), { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      : Promise.resolve(offlineData(loginPhone())).then(function (d) { var o = d.orders.filter(function (x) { return x.code === code; })[0]; if (!o) throw 404; return { order: o, owner: o.rep }; });
  }
  /* E9 再来一单：复制条目进询价单，下架的跳过 */
  function againOrder(o) {
    var q = loadQ(), n = 0, off = o.offItems || 0; // 离线数据里已下架的条目在转换时已去掉，这里补上计数
    (o.items || []).forEach(function (it) {
      if (!planById(it.planId)) { off++; return; }
      n++; q.push({ id: 'q' + Date.now() + Math.random().toString(36).slice(2, 6), planId: it.planId, mode: it.plan.mode, qty: it.qty, months: it.months, days: it.days, startDate: it.startDate, expo: it.expo, fromOrder: o.code });
    });
    saveQ(q);
    if (!n && !off) { toast('这张订单没有套餐条目，可直接找客服'); return; }
    toast(off ? (n ? '有 ' + off + ' 个套餐已下架，已为您保留其他条目' : '套餐都已下架，请联系客服') : '已加入询价单（' + n + ' 项）');
    if (n) location.hash = '#/quote';
  }
  /* E6 报价区块 */
  function quoteBlock(o) {
    var q = o.quote; if (!q) return '';
    var acted = q.customerAction ? '<div class="qa-done" id="qa-done">✓ 已通知您的专属客服（您选择了「' + (q.customerAction === 'confirm' ? '确认报价，请安排签约' : '有疑问，请联系我') + '」）</div>' : '';
    return '<div class="box quote-box" id="od-quote"><h4>正式报价 <span class="note">' + esc((q.sentAt || '').replace('T', ' ').slice(0, 16)) + ' 发送</span></h4>' +
      q.items.map(function (x) { return '<div class="kv"><span>' + esc(x.name) + ' × ' + x.qty + '</span><span>' + yen(x.price) + (x.unit ? esc(x.unit) : '') + ' · 小计 ' + yen(x.subtotal) + '</span></div>'; }).join('') +
      '<div class="kv"><span><b>合计</b></span><b class="price" id="quote-sum">' + yen(q.total) + '</b></div><div class="kv"><span>有效期至</span><span id="quote-valid">' + esc(q.validUntil) + '</span></div>' +
      (q.note ? '<div class="note">' + esc(q.note) + '</div>' : '') + '<div class="note">以正式合同为准 · 本页不涉及付款</div>' +
      (q.expired ? '<div class="qa-exp" id="qa-exp">报价已过期，请联系客服</div><div class="btns row2"><button class="btn o" disabled>有疑问，请联系我</button><button class="btn a" disabled>确认报价，请安排签约</button></div>'
        : acted || '<div class="btns row2"><button class="btn o" data-qa="question" id="qa-question">有疑问，请联系我</button><button class="btn a" data-qa="confirm" id="qa-confirm">确认报价，请安排签约</button></div>') + '</div>';
  }
  function quoteAction(o, act) {
    var fin = function () { toast('已通知您的专属客服'); pageOrderDetail(o.code); };
    if (!ONLINE) { var m = lsGet(QAKEY, {}); m[o.code] = { action: act, at: new Date().toISOString() }; lsSet(QAKEY, m); return fin(); }
    fetch('/api/customer/orders/' + encodeURIComponent(o.code) + '/quote-action', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: act }) })
      .then(function (r) { return r.json().then(function (j) { if (r.ok) fin(); else { toast(j.error || '操作失败'); pageOrderDetail(o.code); } }); });
  }

  /* ---------- E7 搜索 ---------- */
  function planText(p) {
    var tags = D.usageTags.filter(function (t) { return p.usageTagIds.indexOf(t.id) >= 0; }).map(function (t) { return t.name; });
    var dev = (p.devices || []).map(function (d) { return [d.brand, d.model, d.type, d.paper, d.color ? '彩色' : '黑白'].join(' '); });
    return [p.name, p.tagline, (p.points || []).join(' '), dev.join(' '), tags.join(' '), (p.keywords || []).join(' '), MODES[p.mode].title].join(' ').toLowerCase();
  }
  function searchPlans(q) {
    var ws = q.toLowerCase().split(/\s+/).filter(Boolean); if (!ws.length) return [];
    return D.plans.filter(function (p) { if (p.published === false) return false; var t = planText(p); return ws.every(function (w) { return t.indexOf(w) >= 0; }); });
  }
  function miniCard(p) {
    return '<a class="pcard" href="#/plan/' + p.mode + '/' + p.slug + '"><div class="pimg">' + img(p) + '</div><div class="pinfo"><div class="pname"><span class="tier ' + p.tier + '">' + TIER[p.tier] + '</span>' + esc(p.name) + '</div>' +
      '<div class="note">' + MODES[p.mode].title + '</div><div class="price">' + priceHTML(p) + '</div></div></a>';
  }
  function pageSearch(q) {
    var kw = (q.q || '').trim(), hot = D.hotKeywords || [], hist = lsGet(HKEY, []);
    if (kw) { hist = [kw].concat(hist.filter(function (x) { return x !== kw; })).slice(0, 8); lsSet(HKEY, hist); }
    var res = kw ? searchPlans(kw) : [];
    render(nav('搜索', true) + '<form class="sbar" id="search-form"><input class="f" id="search-input" type="search" placeholder="搜套餐、品牌、型号、用途，如：理光、A3 彩色、财务" value="' + esc(kw) + '"><button class="btn a" id="search-go">搜索</button></form>' +
      (kw ? '<div class="box"><h4>「' + esc(kw) + '」的结果（' + res.length + '）</h4></div><div id="search-results">' + (res.map(miniCard).join('') ||
        emptyState('search-empty', '没找到相关套餐', '找客服报价', '#/consult', 'search-consult')) + '</div>' : '') +
      (hist.length ? '<div class="box"><h4>最近搜索 <button class="small-btn" id="hist-clear" style="float:right">清空</button></h4><div class="chips" id="search-hist">' + hist.map(function (x) { return '<a class="chip" href="#/search?q=' + encodeURIComponent(x) + '">' + esc(x) + '</a>'; }).join('') + '</div></div>' : '') +
      '<div class="box"><h4>热门搜索</h4><div class="chips" id="search-hot">' + hot.map(function (x) { return '<a class="chip" href="#/search?q=' + encodeURIComponent(x) + '">' + esc(x) + '</a>'; }).join('') + '</div></div>', { tab: 'mall' });
    document.getElementById('search-form').onsubmit = function (e) { e.preventDefault(); var v = document.getElementById('search-input').value.trim(); if (v) location.hash = '#/search?q=' + encodeURIComponent(v); };
    if (document.getElementById('hist-clear')) document.getElementById('hist-clear').onclick = function () { lsSet(HKEY, []); pageSearch(q); };
    if (!kw) document.getElementById('search-input').focus();
  }

  /* ---------- E10 收藏与最近浏览（本机；登录后同步） ---------- */
  function favs() { return lsGet(FKEY, []); }
  function isFav(id) { return favs().some(function (x) { return x.id === id; }); }
  function toggleFav(p) {
    var f = favs(), on = isFav(p.id);
    f = on ? f.filter(function (x) { return x.id !== p.id; }) : [{ id: p.id, name: p.name, mode: p.mode, slug: p.slug }].concat(f);
    lsSet(FKEY, f); pushFavs(); toast(on ? '已取消收藏' : '已收藏，可在询价单页和商城底部找到'); return !on;
  }
  function pushFavs() {
    if (!ONLINE || !loginPhone()) return;
    fetch('/api/customer/favorites', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: favs().map(function (x) { return x.id; }) }) }).catch(function () {});
  }
  function syncFavs() { // 登录后：服务器上的收藏 ∪ 本机收藏
    if (!ONLINE) return Promise.resolve();
    return fetch('/api/customer/favorites', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : { ids: [] }; }).then(function (j) {
      var f = favs(), have = f.map(function (x) { return x.id; });
      (j.ids || []).forEach(function (id) { if (have.indexOf(id) < 0) { var p = planById(id); f.push(p ? { id: id, name: p.name, mode: p.mode, slug: p.slug } : { id: id, name: '已下架套餐' }); } });
      lsSet(FKEY, f); pushFavs();
    }).catch(function () {});
  }
  function addRecent(p) { var r = lsGet(RKEY, []).filter(function (x) { return x.id !== p.id; }); r.unshift({ id: p.id, name: p.name, mode: p.mode, slug: p.slug }); lsSet(RKEY, r.slice(0, 10)); }
  function favBlock() {
    function row(x) {
      var p = planById(x.id), on = p && p.published !== false;
      return on ? '<a class="fav-item" href="#/plan/' + p.mode + '/' + p.slug + '" data-fid="' + x.id + '"><span class="pimg">' + img(p) + '</span><span>' + esc(p.name) + '<br><b class="price">' + priceHTML(p) + '</b></span></a>'
        : '<div class="fav-item off" data-fid="' + esc(x.id) + '"><span class="pimg"></span><span>' + esc(x.name || '套餐') + '<br><span class="tag-off">已下架</span></span></div>';
    }
    var f = favs(), r = lsGet(RKEY, []);
    if (!f.length && !r.length) return '';
    return (f.length ? '<div class="box" id="fav-box"><h4>我收藏的（' + f.length + '）</h4><div class="fav-list" id="fav-list">' + f.map(row).join('') + '</div></div>' : '') +
      (r.length ? '<div class="box" id="recent-box"><h4>最近看过</h4><div class="fav-list" id="recent-list">' + r.map(row).join('') + '</div></div>' : '');
  }

  /* ---------- E8 分享海报 ---------- */
  function shareLink(p) {
    var ref = sceneVal('ref'), chn = sceneVal('channel'), sc = ref ? 's_' + ref : chn ? 'c_' + chn : '';
    return { scene: sc, url: location.href.split(/[?#]/)[0] + (sc ? '?scene=' + sc : '') + '#/plan/' + p.mode + '/' + p.slug };
  }
  function showPoster(p) {
    var L = shareLink(p), W = 600, H = 960, c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d'), col = (PAL[p.tier] || PAL.basic);
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    var g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#0B2A6F'); g.addColorStop(1, '#2563EB'); x.fillStyle = g; x.fillRect(0, 0, W, 120);
    x.fillStyle = '#fff'; x.font = 'bold 34px sans-serif'; x.fillText(S.company.short + ' · 办公设备租赁', 32, 56); x.font = '22px sans-serif'; x.fillText(D.posterSlogan || '政企办公设备租赁 · 1 台起租', 32, 96);
    x.fillStyle = col[0]; x.fillRect(32, 150, W - 64, 300); x.fillStyle = col[1]; x.fillRect(200, 230, 200, 120); x.fillStyle = '#fff'; x.fillRect(225, 205, 150, 40); x.fillRect(225, 320, 150, 60);
    x.fillStyle = '#111'; x.font = 'bold 36px sans-serif'; x.fillText(p.name, 32, 510);
    var pr = priceHTML(p).replace(/<[^>]+>/g, ''); x.fillStyle = '#EA580C'; x.font = 'bold 40px sans-serif'; x.fillText(pr + ' 起', 32, 570);
    x.fillStyle = '#334155'; x.font = '26px sans-serif'; (p.points || []).slice(0, 3).forEach(function (t, i) { x.fillText('✓ ' + t, 32, 625 + i * 42); });
    window.MPCODE.draw(x, W - 232, H - 262, 200, L.scene + '|' + p.slug);
    x.fillStyle = '#64748B'; x.font = '20px sans-serif'; x.fillText('长按识别小程序码，查看套餐详情', 32, H - 120);
    x.fillText(L.scene ? '专属服务码：' + L.scene : '以商务报价为准 · 合同线下签订', 32, H - 84); x.fillText('（演示版：小程序码为模拟图案）', 32, H - 50);
    var url = c.toDataURL('image/png');
    document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet" id="poster-sheet"><h3>分享海报</h3><img id="poster-img" src="' + url + '" data-link="' + esc(L.url) + '" data-scene="' + esc(L.scene) + '" style="width:100%;border-radius:8px;border:1px solid var(--line)">' +
      '<div class="btns row2" style="margin-top:10px"><a class="btn o" id="poster-dl" download="套餐海报_' + esc(p.slug) + '.png" href="' + url + '">保存到相册</a><button class="btn a" id="poster-share">转发给朋友</button></div>' +
      '<p class="note" id="poster-link" style="word-break:break-all">' + esc(L.url) + '</p><div class="btns"><button class="btn o" id="keep">关闭</button></div></div></div>';
    document.getElementById('keep').onclick = closeModal;
    document.getElementById('poster-share').onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(L.url) : Promise.reject()).then(function () { toast('链接已复制，可发给朋友'); }, function () { toast('转发链接：' + L.url); }); };
  }

  /* ---------- E12 设置 / 隐私 ---------- */
  function pageSettings() {
    var ph = loginPhone();
    render(nav('设置', true) + '<div class="box set-list" id="set-list"><a href="#/privacy" id="set-policy">查看隐私政策 <span>›</span></a>' +
      (ph ? '<a href="#/notices" id="set-notices">服务通知（模拟微信） <span>›</span></a><button id="privacy-del">申请删除我的个人信息 <span>›</span></button><button id="set-logout">退出登录 <span>›</span></button>' : '<a href="#/login">登录 <span>›</span></a>') + '</div>' +
      '<p class="note" style="padding:0 16px">正式版：小程序右上角「···」→ 设置 也可以管理授权；删除申请处理后，您的姓名、手机号会被打码。</p>', { tab: 'mine' });
    if (!ph) return;
    document.getElementById('set-logout').onclick = function () { logout(); location.hash = '#/mine'; };
    document.getElementById('privacy-del').onclick = function () {
      document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet" id="del-sheet"><h3>申请删除个人信息</h3><p>提交后，我们会删除（打码）您的姓名、手机号、微信号。<b class="red">已提交的询价单将停止跟进</b>，「我的」里将看不到历史订单。</p>' +
        '<label class="check"><input type="checkbox" id="del-ack"> 我已了解上述影响</label><div class="btns row2"><button class="btn o" id="keep">取消</button><button class="btn a" id="del-next">下一步</button></div></div></div>';
      document.getElementById('keep').onclick = closeModal;
      document.getElementById('del-next').onclick = function () {
        if (!document.getElementById('del-ack').checked) return toast('请先勾选「我已了解」');
        document.getElementById('del-sheet').innerHTML = '<h3>再次确认</h3><p>确定申请删除 ' + esc(mask(ph)) + ' 的个人信息吗？此操作不能撤销。</p><div class="btns row2"><button class="btn o" id="keep2">再想想</button><button class="btn a" id="del-confirm">确认申请删除</button></div>';
        document.getElementById('keep2').onclick = closeModal;
        document.getElementById('del-confirm').onclick = function () {
          if (!ONLINE) {
            var d = lsGet(DELKEY, []); if (d.indexOf(ph) < 0) d.push(ph); lsSet(DELKEY, d);
            lsSet(MYKEY, lsGet(MYKEY, []).filter(function (o) { return o.phone !== ph; }));
            closeModal(); toast('离线演示：已删除本机记录'); localStorage.removeItem(LKEY); location.hash = '#/mine'; return;
          }
          fetch('/api/customer/privacy-delete', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(function (r) {
            closeModal(); toast(r.ok ? '申请已提交，处理后将通知客服停止跟进' : '提交失败'); if (r.ok) document.getElementById('privacy-del').outerHTML = '<div class="note" id="del-sent">✓ 删除申请已提交，等待处理</div>';
          });
        };
      };
    };
  }
  function pageNotices() {
    if (!loginPhone()) { location.hash = '#/login'; return; }
    if (!ONLINE) { render(nav('服务通知', true) + '<div class="empty" id="notice-empty">离线演示没有推送消息<br>（连接本地测试服务器后可看到模拟的微信服务通知）</div>', { tab: 'mine' }); return; }
    fetch('/api/customer/notices', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (d) {
      render(nav('服务通知', true) + '<div id="notices">' + ((d.items || []).map(function (n) {
        return '<a class="box notice" href="' + esc(n.page) + '" data-code="' + esc(n.code) + '"><div class="note">' + esc(n.tmplName) + ' · ' + esc(n.at.replace('T', ' ').slice(5, 16)) + '</div><b>' + esc(n.title) + '</b><div class="note">订单 ' + esc(n.code) + ' · 点击查看详情 ›</div></a>';
      }).join('') || '<div class="empty" id="notice-empty">暂无通知</div>') + '</div>', { tab: 'mine' });
    });
  }
  function pagePrivacy() {
    render(nav('个人信息处理说明', true) + '<div class="box" data-sec="privacy.main"><h4>个人信息处理说明 <span class="note">' + esc(T('privacy.main.version', '')) + '</span></h4><p style="font-size:13px;line-height:1.8;white-space:pre-wrap">' +
      esc(T('privacy.main.text', '您提交的信息只用于联系您和报价。')) + '</p></div>', { tab: '' });
  }
  function page404() { render(nav('页面不存在', true) + '<div class="empty">页面不存在<br><a class="btn p" href="#/">回首页</a></div>', {}); }

  /* ---------- 路由 ---------- */
  function route() {
    var h = location.hash.replace(/^#/, '') || '/', parts = h.split('?'), path = parts[0].split('/').filter(Boolean), q = {};
    (parts[1] || '').split('&').forEach(function (kv) { if (kv) { var a = kv.split('='); q[a[0]] = decodeURIComponent(a[1] || ''); } });
    var titles = { '': '首页', mall: '设备商城', list: '套餐列表', plan: '套餐详情', quote: '询价单', consult: '找客服报价', done: '提交成功', guide: '对公采购流程', privacy: '个人信息处理说明', mine: '我的', login: '登录', order: '订单详情', recommend: '推荐套餐', search: '搜索', settings: '设置', notices: '服务通知' };
    document.title = (titles[path[0] || ''] || '页面') + ' · ' + S.company.short + '办公设备租赁' + (ONLINE ? '（测试环境）' : '（演示版）');
    switch (path[0]) {
      case undefined: return pageHome();
      case 'mall': return pageMall();
      case 'list': return pageList(path[1], q);
      case 'plan': return pageDetail(path[1], path[2]);
      case 'quote': return pageQuote();
      case 'consult': return pageConsult(q);
      case 'done': return pageDone(q);
      case 'guide': return pageGuide();
      case 'privacy': return pagePrivacy();
      case 'mine': return pageMine();
      case 'login': return pageLogin();
      case 'order': return pageOrderDetail(path[1]);
      case 'recommend': return pageRecommend();
      case 'search': return pageSearch(q);
      case 'settings': return pageSettings();
      case 'notices': return pageNotices();
      case 'showcase': return path[1] ? pageShowcase(decodeURIComponent(path[1])) : pageShowcaseList(q);
      default: return page404();
    }
  }
  window.addEventListener('hashchange', route);
  // 后台手机预览：接收「滚动到分区」指令
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'scrollTo') return;
    var el = document.querySelector('[data-sec="' + e.data.section + '"]');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('sec-flash'); setTimeout(function () { el.classList.remove('sec-flash'); }, 1500); }
  });
  route();
  }
})();
