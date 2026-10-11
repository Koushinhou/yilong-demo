/* 租赁网站 前端演示版：纯静态 SPA，hash 路由，数据来自 js/data.js，询价单存 localStorage */
(function () {
  var D = window.DATA, S = D.site, $app = document.getElementById('app');
  var MODES = {
    long: { title: '长期租用', bar: '按月计费，含印量，超出按张计费', icon: '📅' },
    short: { title: '短期租用', bar: '1 天起租，按天计费', icon: '⏱️' },
    expo: { title: '展会快速租用', bar: '展会专享，送装到展馆，撤展回收', icon: '🎪' }
  };
  var TIER = { basic: '普通', allin: '全包', premium: '豪华' };
  var QKEY = 'rental_demo_quote_v1', PKEY = 'rental_demo_profile_v1';

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
    return Math.min.apply(null, plans(mode).map(function (p) { return p.pricing[k] || 1e9; }));
  }
  var PAL = { basic: ['#DBEAFE', '#1E40AF'], allin: ['#DCFCE7', '#15803D'], premium: ['#FEF3C7', '#B45309'] };
  function img(p) { // 占位图（SVG，非真实产品图）
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
  function budget(item) {
    var p = planById(item.planId), r = p.pricing, base;
    if (p.mode === 'long') { if (!r.monthlyFee) return null; base = r.monthlyFee * item.months * item.qty; }
    else { if (!r.dailyFee) return null; base = r.dailyFee * item.days * item.qty; if (p.mode === 'expo') base += (r.fixedFee || 0); }
    var rt = S.roundTo || 10, min = Math.round(base / rt) * rt, max = Math.round(base * (1 + S.budgetBufferRate) / rt) * rt;
    return { min: min, max: max };
  }
  function formula(item) {
    var p = planById(item.planId), r = p.pricing;
    if (p.mode === 'long') return yen(r.monthlyFee) + '/月 × ' + item.months + ' 个月 × ' + item.qty + ' 台';
    var s = yen(r.dailyFee) + '/天 × ' + item.days + ' 天 × ' + item.qty + ' 台';
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
      esc(title) + '<a class="qbadge" href="#/quote" aria-label="询价单">🧾' + (n ? '<span class="dot qcount">' + n + '</span>' : '') + '</a></div>';
  }
  function tabbar(on) {
    var n = qCount();
    function t(k, h, ic, tx) { return '<a href="' + h + '" class="' + (on === k ? 'on' : '') + '"><span class="ic">' + ic + '</span>' + tx + (k === 'quote' && n ? '<span class="dot">' + n + '</span>' : '') + '</a>'; }
    return '<nav class="tabbar">' + t('home', '#/', '🏠', '首页') + t('mall', '#/mall', '🛍️', '商城') + t('quote', '#/quote', '🧾', '询价单') + t('kf', '#/consult', '💬', '客服') + '</nav>';
  }
  function render(html, opts) {
    opts = opts || {};
    $app.className = opts.bar ? 'has-bar' : '';
    $app.innerHTML = html + tabbar(opts.tab);
    window.scrollTo(0, 0);
    closeModal();
  }

  /* ---------- 页面 ---------- */
  function pageHome() {
    render('<div class="hero"><div class="top"><div class="logo"><i>' + esc(S.company.short.slice(0, 1)) + '</i>' + esc(S.company.short) + '</div>' +
      '<a class="tel" href="tel:' + esc(S.company.phone) + '" aria-label="电话">📞</a></div>' +
      '<div class="main"><h1>' + esc(S.company.name) + '</h1><p class="slogan">' + esc(S.company.slogan) + '</p>' +
      '<a class="cta" id="enter-mall" href="#/mall">进入租赁设备商城 →</a></div>' +
      '<a class="trust" href="#/guide"><span>对公发票</span><span>正式合同</span><span>上门维保</span></a>' +
      '<div class="foot"><a href="#/guide">对公采购流程</a><a href="#/guide">关于我们</a><a href="tel:' + esc(S.company.phone) + '">联系</a><br>' + esc(S.company.icp) + ' · 演示版，数据均为示例</div></div>', { tab: 'home' });
  }

  var carTimer;
  function pageMall() {
    var bs = D.banners;
    render(nav('租赁设备商城', true) +
      '<div class="carousel" id="carousel"><div class="slides">' + bs.map(function (b) { return '<a class="slide" href="' + esc(b.link) + '" style="background:linear-gradient(120deg,' + b.color + ',' + b.color + 'cc)"><b>' + esc(b.title) + '</b><span>' + esc(b.sub) + '</span></a>'; }).join('') +
      '</div><div class="dots">' + bs.map(function (_, i) { return '<i class="' + (i ? '' : 'on') + '"></i>'; }).join('') + '</div></div>' +
      '<div class="sell"><span>1 台起租</span><span>按天/按月</span><span>对公发票</span><span>上门维保</span></div>' +
      '<a class="expo-card" id="entry-expo" href="#/list/expo"><span class="tag">🔥 展会专享</span><h2>展会快速租用</h2><p>一天套餐 ' + yen(minPrice('expo')) + ' 起 · 送装到展馆</p><span class="go">立即查看 →</span><span class="big">🎪</span></a>' +
      '<div class="two"><a id="entry-long" href="#/list/long"><div class="ic">📅</div><h3>长期租用</h3><p>按月计费 · 含印量</p><div class="pr">' + yen(minPrice('long')) + '/月起</div></a>' +
      '<a id="entry-short" href="#/list/short"><div class="ic">⏱️</div><h3>短期租用</h3><p>1 天起租 · 随租随还</p><div class="pr">' + yen(minPrice('short')) + '/天起</div></a></div>' +
      '<a class="gov" href="#/guide"><span>批量采购</span><span>对公结算</span><span>报价单</span><span>›</span></a>', { tab: 'mall' });
    // 轮播：4 秒自动 + 手指滑动
    var i = 0, el = document.querySelector('#carousel .slides'), ds = document.querySelectorAll('#carousel .dots i');
    function go(n) { i = (n + bs.length) % bs.length; el.style.transform = 'translateX(-' + i * 100 + '%)'; ds.forEach(function (d, k) { d.className = k === i ? 'on' : ''; }); }
    clearInterval(carTimer); carTimer = setInterval(function () { if (document.body.contains(el)) go(i + 1); else clearInterval(carTimer); }, 4000);
    var x0 = null; el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  var listState = {};
  function pageList(mode) {
    if (!MODES[mode]) return page404();
    var st = listState[mode] || (listState[mode] = { tag: 'all', sort: 'rec' });
    var used = {}; plans(mode).forEach(function (p) { p.usageTagIds.forEach(function (t) { used[t] = 1; }); });
    var tags = D.usageTags.filter(function (t) { return used[t.id]; });
    var ps = plans(mode).filter(function (p) { return st.tag === 'all' || p.usageTagIds.indexOf(st.tag) >= 0; });
    var k = mode === 'long' ? 'monthlyFee' : 'dailyFee';
    ps.sort(st.sort === 'price' ? function (a, b) { return (a.pricing[k] || 1e9) - (b.pricing[k] || 1e9); } : function (a, b) { return (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || (a.sort || 0) - (b.sort || 0); });
    var n = qCount();
    render(nav(MODES[mode].title, true) + '<div class="modebar">' + MODES[mode].icon + ' ' + MODES[mode].bar + '</div>' +
      '<div class="filters">' + [{ id: 'all', name: '全部' }].concat(tags).map(function (t) { return '<button class="chip ' + (st.tag === t.id ? 'on' : '') + '" data-tag="' + t.id + '">' + esc(t.name) + '</button>'; }).join('') + '</div>' +
      '<div class="sort"><button data-sort="rec" class="' + (st.sort === 'rec' ? 'on' : '') + '">推荐</button><button data-sort="price" class="' + (st.sort === 'price' ? 'on' : '') + '">价格 ↑</button></div>' +
      (ps.length ? ps.map(function (p) {
        return '<a class="pcard" href="#/plan/' + mode + '/' + p.slug + '"><div class="pimg">' + img(p) + '</div><div class="pinfo">' +
          '<div class="pname"><span class="tier ' + p.tier + '">' + TIER[p.tier] + '</span>' + esc(p.name) + '</div>' +
          '<div class="pts">' + (p.points || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
          '<div class="price">' + priceHTML(p) + '</div></div><button class="plus" data-add="' + p.id + '" aria-label="加入询价单"><i>+</i></button></a>';
      }).join('') : '<div class="empty">没有合适的套餐？<br><a class="btn p" href="#/consult">直接找客服报价</a></div>') +
      '<a class="fab" href="#/quote" aria-label="询价单">🧾' + (n ? '<span class="dot">' + n + '</span>' : '') + '</a>', { tab: 'mall' });
    $app.querySelectorAll('[data-tag]').forEach(function (b) { b.onclick = function () { st.tag = b.dataset.tag; pageList(mode); }; });
    $app.querySelectorAll('[data-sort]').forEach(function (b) { b.onclick = function () { st.sort = b.dataset.sort; pageList(mode); }; });
    $app.querySelectorAll('[data-add]').forEach(function (b) { b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); addToQuote(defaultItem(planById(b.dataset.add))); }; });
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

  function pageDetail(mode, slug) {
    var p = plans(mode).filter(function (x) { return x.slug === slug; })[0];
    if (!p) return page404();
    var it = defaultItem(p), r = p.pricing, dev = p.devices;
    var sel = '';
    if (mode === 'long') {
      sel = '<div class="row"><label>租期</label><div class="opts">' + (r.termOptionsMonths || [12]).map(function (m) { return '<button class="opt" data-months="' + m + '">' + m + ' 个月</button>'; }).join('') + '</div></div>' +
        qtyRow() + '<div class="calc" id="calc"><b>月费估算器</b>　每月预计印量（黑白）<input class="f" id="vol" type="number" inputmode="numeric" value="' + (r.includedMono || 0) + '" style="margin-top:6px"><div id="calcout" style="margin-top:6px"></div></div>';
    } else if (mode === 'short') {
      sel = '<div class="row"><label>开始日期</label><input class="f" type="date" id="sdate" value="' + it.startDate + '"></div>' +
        '<div class="row"><label>租用天数</label>' + stepper('days', it.days) + '</div>' + qtyRow() +
        '<div class="calc" id="calcout"></div><div class="hint" id="caphint" style="display:none"></div>';
    } else {
      sel = '<div class="row"><label>展会名称</label><input class="f" id="ename" placeholder="选填，如：某某博览会"></div>' +
        '<div class="row"><label>使用日期</label><input class="f" type="date" id="sdate" value="' + it.startDate + '"></div>' +
        '<div class="row"><label>展期天数</label>' + stepper('days', it.days) + '</div>' + qtyRow() +
        '<div class="row"><label>送装地点</label><input class="f" id="venue" placeholder="选填，展馆/展位号"></div>' +
        '<div class="row"><label>送装时间</label><input class="f" id="dtime" placeholder="选填，如：布展日 9:00"></div>' +
        '<div class="calc" id="calcout"></div>';
    }
    function qtyRow() { return '<div class="row"><label>台数</label>' + stepper('qty', 1) + '</div>'; }
    function stepper(k, v) { return '<div class="step"><button data-dec="' + k + '" aria-label="减">−</button><input id="' + k + '" type="number" inputmode="numeric" min="1" value="' + v + '"><button data-inc="' + k + '" aria-label="加">+</button></div>'; }
    var devRows = dev.map(function (d) { return '<tr><td>设备</td><td>' + esc(d.brand + ' ' + d.model) + '（' + esc(d.type) + '）× ' + d.qty + '<br><span class="note">' + esc(d.condition) + ' · ' + (d.color ? '彩色' : '黑白') + ' · ' + d.paper + ' · ' + d.speed + ' 页/分钟</span></td></tr>'; }).join('');
    var pr = '';
    if (r.includedMono) pr += '<tr><td>含印量</td><td>黑白 ' + r.includedMono + ' 张/月' + (r.includedColor ? '，彩色 ' + r.includedColor + ' 张/月' : '') + '</td></tr>';
    if (r.overageMono) pr += '<tr><td>超印单价</td><td>黑白 ¥' + r.overageMono + '/张' + (r.overageColor ? '，彩色 ¥' + r.overageColor + '/张' : '') + '</td></tr>';
    var special = mode === 'expo' ? '<div class="box"><h4>展会服务流程</h4><div class="steps"><div><b>1</b>在线预约</div><div><b>2</b>送装到展位</div><div><b>3</b>现场调试</div><div><b>4</b>撤展回收</div></div><div class="note" style="margin-top:10px">服务过的展会：示例博览会 A、示例展会 B（演示数据）</div></div>' : '';
    var bill = mode === 'long' ? '月费 × 租期 × 台数；超出含印量部分按张计费' : mode === 'short' ? '日租 × 天数 × 台数；长期使用建议选长租' : '一天套餐 × 天数 × 台数 + 送装费';
    var btn1 = mode === 'expo' ? '立即预约' : '加入询价单';
    render(nav(MODES[mode].title, true) + '<div class="dimg">' + img(p) + '</div>' +
      '<div class="box"><div class="dname"><span class="tier ' + p.tier + '">' + TIER[p.tier] + '</span>' + esc(p.name) + '</div><div class="dline">' + esc(p.tagline || '') + '</div>' +
      '<div class="price dprice">' + priceHTML(p) + '</div><div class="note">最终以商务报价为准</div></div>' +
      '<div class="box" id="selector" data-mode="' + mode + '"><h4>选择' + (mode === 'long' ? '租期与台数' : mode === 'short' ? '日期与台数' : '展会信息') + '</h4>' + sel + '</div>' +
      '<div class="box"><h4>套餐包含</h4><table class="inc">' + devRows + pr + p.includes.map(function (x) { return '<tr><td>' + esc(x.label) + '</td><td>' + esc(x.value) + '</td></tr>'; }).join('') + '</table></div>' +
      special +
      '<div class="box"><h4>适用用途</h4><div class="tags">' + p.usageTagIds.map(function (t) { var u = D.usageTags.filter(function (x) { return x.id === t; })[0]; return u ? '<span>' + esc(u.name) + '</span>' : ''; }).join('') + '</div></div>' +
      '<div class="box"><h4>计费说明</h4><div class="note" style="font-size:13px">' + bill + '。不含超印费，以商务报价为准。</div></div>' +
      '<a class="box gov" href="#/guide" style="margin:10px 12px"><span>正式合同</span><span>对公发票</span><span>资质齐全</span><span>›</span></a>' +
      '<div class="actbar"><a class="mini" href="#/consult"><span class="ic">💬</span>客服</a><a class="mini q" href="#/quote"><span class="ic">🧾</span>询价单' + (qCount() ? '<span class="dot">' + qCount() + '</span>' : '') + '</a>' +
      '<button class="btn a" id="btn-add">' + btn1 + '</button><button class="btn p" id="btn-consult">直接找客服报价</button></div>', { tab: 'mall', bar: true });

    function $(id) { return document.getElementById(id); }
    function num(id) { var v = parseInt($(id).value, 10); return v > 0 ? v : 1; }
    function read() {
      it.qty = num('qty');
      if (mode !== 'long') { it.days = num('days'); it.startDate = $('sdate').value; }
      if (mode === 'expo') it.expo = { name: $('ename').value.trim(), venue: $('venue').value.trim(), deliveryTime: $('dtime').value.trim() };
    }
    function update() {
      read();
      if (mode === 'long') {
        document.querySelectorAll('[data-months]').forEach(function (b) { b.classList.toggle('on', +b.dataset.months === it.months); });
        var vol = Math.max(0, +$('vol').value || 0), over = Math.max(0, vol - (r.includedMono || 0));
        $('calcout').innerHTML = '预计月费 ≈ <b class="price">' + yen(Math.round((r.monthlyFee + over * (r.overageMono || 0)) * it.qty)) + '</b>（' + it.qty + ' 台' + (over ? '，超印 ' + over + ' 张' : '，在含印量内') + '）';
      } else {
        var b = budget(it);
        $('calcout').innerHTML = formula(it) + ' = <b class="price">' + yen(b.min) + '</b>';
        if (mode === 'short' && $('caphint')) {
          var cap = r.monthlyFee && r.dailyFee * it.days >= r.monthlyFee;
          $('caphint').style.display = cap ? '' : 'none';
          $('caphint').textContent = '租用 ' + it.days + ' 天已超过月租价 ' + yen(r.monthlyFee) + '，长租更划算，可咨询客服。';
        }
      }
    }
    document.querySelectorAll('[data-months]').forEach(function (b) { b.onclick = function () { it.months = +b.dataset.months; update(); }; });
    document.querySelectorAll('[data-inc]').forEach(function (b) { b.onclick = function () { var e = $(b.dataset.inc); e.value = num(b.dataset.inc) + 1; update(); }; });
    document.querySelectorAll('[data-dec]').forEach(function (b) { b.onclick = function () { var e = $(b.dataset.dec); e.value = Math.max(1, num(b.dataset.dec) - 1); update(); }; });
    $app.querySelectorAll('#selector input').forEach(function (e) { e.oninput = update; });
    update();
    $('btn-add').onclick = function () { read(); var c = JSON.parse(JSON.stringify(it)); c.id = 'q' + Date.now(); addToQuote(c); };
    $('btn-consult').onclick = function () { read(); sessionStorage.setItem('rental_demo_consult', JSON.stringify([it])); location.hash = '#/consult?from=plan'; };
  }

  /* ---------- 预算弹窗 ---------- */
  function closeModal() { document.getElementById('modal').innerHTML = ''; }
  function showBudget(it) {
    var p = planById(it.planId), b = budget(it), all = totals();
    document.getElementById('modal').innerHTML = '<div class="mask" id="mask"><div class="sheet" role="dialog" id="budget-modal">' +
      '<h3>' + (p.mode === 'expo' ? '预约已加入询价单' : '已加入询价单') + '</h3><div class="ok">✓ 询价单共 ' + qCount() + ' 项</div>' +
      '<div class="bud">本项预估预算<span class="price" id="budget-range">' + (b ? '约 ' + yen(b.min) + '–' + yen(b.max) : '需商务报价') + '</span></div>' +
      '<div class="formula">' + esc(p.name) + '<br>' + (b ? formula(it) + '，上限再加 ' + Math.round(S.budgetBufferRate * 100) + '%' : '') + '<br><span class="note">不含超印费 · 以商务报价为准 · 可开对公发票</span>' +
      (all.n > 1 ? '<br>询价单合计：约 ' + yen(all.min) + '–' + yen(all.max) : '') + '</div>' +
      '<div class="btns"><a class="btn a block" href="#/quote" id="go-quote">去询价单提交</a><div class="row2"><button class="btn o" id="keep">继续逛</button><a class="btn o" href="#/consult?from=quote">直接找客服报价</a></div></div></div></div>';
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
    render(nav('询价单', true) + '<div class="modebar">ℹ️ 这是询价单，无需在线付款。提交后商务人员会联系您报价，合同线下签订。</div>' +
      (items.length ? '<div class="box"><h4>询价内容（' + items.length + '）</h4>' + items.map(function (it) {
        var p = planById(it.planId), b = budget(it);
        return '<div class="qitem" data-id="' + it.id + '"><div class="pimg">' + img(p) + '</div><div style="flex:1;min-width:0"><div class="pname" style="font-size:14px">' + esc(p.name) + '</div>' +
          '<div class="meta">' + MODES[p.mode].title + ' · ' + esc(itemMeta(it)) + '</div><div class="meta">预算 ' + (b ? '<span class="price">约 ' + yen(b.min) + '–' + yen(b.max) + '</span>' : '需商务报价') + '</div>' +
          '<div class="ops"><div class="step"><button data-q="-1" aria-label="减">−</button><input value="' + it.qty + '" readonly><button data-q="1" aria-label="加">+</button></div><button class="del" data-del>删除</button></div></div></div>';
      }).join('') + '</div><div class="box total"><span>合计预估</span><span class="price" id="quote-total">约 ' + yen(t.min) + '–' + yen(t.max) + (t.unknown ? ' + 需报价项' : '') + '</span></div>' +
      '<div class="box form" id="qform"><h4>联系信息</h4>' + contactFields(prof, true) +
      '<button class="btn a block" id="submit-quote">提交询价</button><a class="btn o block" style="margin-top:10px" href="#/consult?from=quote">直接找客服报价</a></div>'
        : '<div class="empty">询价单还是空的<br><a class="btn p" href="#/mall">去商城看看</a></div>'), { tab: 'quote' });
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
    return fi('org', '单位名称', true, '如：某某区政务服务中心') + fi('name', '联系人', true, '您的称呼') + fi('phone', '手机', true, '11 位手机号', 'tel') +
      fi('wechat', '微信号（选填）', false, '填了客服加得更快') +
      (quote ? '<div class="fi"><label>开票需求</label><select class="f" id="invoice"><option>增值税专票</option><option>增值税普票</option><option>暂不需要</option></select></div>' : '') +
      '<div class="fi"><label>备注</label><textarea class="f" id="msg" rows="2" placeholder="选填，如：需要合同模板、报价单 PDF"></textarea></div>' +
      '<label class="check"><input type="checkbox" id="consent" checked>同意将以上信息用于联系报价</label>';
  }
  function validate() {
    var ok = true;
    function bad(id, m) { var f = document.getElementById('fi-' + id); f.classList.toggle('bad', !!m); f.querySelector('.err').textContent = m || ''; if (m) ok = false; }
    var org = document.getElementById('org').value.trim(), name = document.getElementById('name').value.trim(), ph = document.getElementById('phone').value.trim();
    bad('org', org ? '' : '请填写单位名称'); bad('name', name ? '' : '请填写联系人');
    bad('phone', !ph ? '请填写手机号' : /^1[3-9]\d{9}$/.test(ph) ? '' : '手机号格式不正确（11 位，1 开头）');
    if (ok && !document.getElementById('consent').checked) { toast('请勾选同意用于联系报价'); ok = false; }
    if (!ok) { toast('请检查必填项'); return null; }
    var pf = { org: org, name: name, phone: ph, wechat: document.getElementById('wechat').value.trim() };
    localStorage.setItem(PKEY, JSON.stringify(pf)); return pf;
  }
  function submitLead(type, items) {
    var pf = validate(); if (!pf) return;
    // 演示版：只模拟提交（不发送到任何服务器）
    var no = (type === 'quote' ? 'XJ' : 'KF') + new Date().toISOString().slice(2, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 9000) + 1000);
    sessionStorage.setItem('rental_demo_done', JSON.stringify({ no: no, type: type, n: items.length }));
    if (type === 'quote') saveQ([]);
    location.hash = '#/done?type=' + type;
  }

  /* ---------- 找客服报价 ---------- */
  function pageConsult(q) {
    var items = [];
    if (q.from === 'plan') { try { items = JSON.parse(sessionStorage.getItem('rental_demo_consult') || '[]'); } catch (e) {} }
    else if (q.from === 'quote') items = loadQ();
    items = items.filter(function (it) { return planById(it.planId); });
    render(nav('找客服报价', true) + '<div class="modebar">💬 留下联系方式，微信客服会主动添加您并报价</div>' +
      (items.length ? '<div class="box" id="prefill"><h4>咨询内容（已预填）</h4>' + items.map(function (it) { var p = planById(it.planId); return '<div class="qitem"><div class="pimg">' + img(p) + '</div><div><div class="pname" style="font-size:14px">' + esc(p.name) + '</div><div class="meta">' + MODES[p.mode].title + ' · ' + esc(itemMeta(it)) + '</div></div></div>'; }).join('') + '</div>' : '') +
      '<div class="box form"><h4>您的联系方式</h4>' + contactFields(profile(), false) + '<button class="btn a block" id="submit-consult">提交，等客服添加我</button></div>' +
      '<div class="box" style="text-align:center"><div class="note">不想留资料？直接添加客服微信</div><button class="small-btn" style="margin-top:8px" id="show-qr">显示客服二维码</button><div id="qrbox"></div></div>', { tab: 'kf' });
    document.getElementById('submit-consult').onclick = function () { submitLead('consult', items); };
    document.getElementById('show-qr').onclick = function () { document.getElementById('qrbox').innerHTML = qr() + '<div class="note">微信号：' + esc(S.company.wechat) + '</div>'; };
  }
  function qr() { // 占位二维码（固定图案，不可扫描）
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

  function pageDone(q) {
    var d = {}; try { d = JSON.parse(sessionStorage.getItem('rental_demo_done') || '{}'); } catch (e) {}
    render(nav('提交成功', false) + '<div class="box done"><div class="ck">✓</div><h2>' + (q.type === 'quote' ? '询价已提交' : '资料已提交') + '</h2>' +
      '<div class="no">编号：<b id="lead-no">' + esc(d.no || '演示编号') + '</b></div>' +
      '<p style="margin-top:12px;font-size:16px;font-weight:600;color:var(--pri)">客服将主动添加您</p><p class="note">工作时间内 ' + S.replySlaHours + ' 小时内添加，请留意微信好友申请</p>' +
      qr() + '<p class="note">想更快？也可以直接扫码添加客服</p></div>' +
      '<div class="box"><div class="kv"><span>客服微信号</span><span>' + esc(S.company.wechat) + ' <button class="small-btn" id="copy">复制</button></span></div>' +
      '<div class="kv"><span>业务电话</span><a class="small-btn" style="display:flex;align-items:center" href="tel:' + esc(S.company.phone) + '">' + esc(S.company.phone) + '</a></div></div>' +
      '<div style="padding:0 12px"><a class="btn p block" href="#/mall">返回商城</a></div><p class="note" style="text-align:center;margin-top:10px">演示版：提交为模拟，不会真正发送</p>', { tab: '' });
    document.getElementById('copy').onclick = function () {
      var t = S.company.wechat;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('微信号已复制'); }, function () { toast('微信号：' + t); });
    };
  }

  function pageGuide() {
    render(nav('对公采购流程', true) + '<div class="box guide"><h4>流程</h4><ol><li>在线询价或找客服报价</li><li>商务出具正式报价单（可用于内部审批）</li><li>签订租赁合同、盖章</li><li>送货上门安装调试</li><li>按月对账结算，开具对公发票</li><li>到期续租或上门回收</li></ol></div>' +
      '<div class="box guide"><h4>关于我们（示例）</h4><p class="note" style="font-size:13px;line-height:1.7">' + esc(S.company.name) + '，专注政企办公设备租赁。营业执照、厂家授权等资质待客户提供。</p></div>' +
      '<div style="padding:0 12px"><a class="btn a block" href="#/mall">进入租赁设备商城</a></div>', { tab: '' });
  }
  function page404() { render(nav('页面不存在', true) + '<div class="empty">页面不存在<br><a class="btn p" href="#/">回首页</a></div>', {}); }

  /* ---------- 路由 ---------- */
  function route() {
    var h = location.hash.replace(/^#/, '') || '/', parts = h.split('?'), path = parts[0].split('/').filter(Boolean), q = {};
    (parts[1] || '').split('&').forEach(function (kv) { if (kv) { var a = kv.split('='); q[a[0]] = decodeURIComponent(a[1] || ''); } });
    var titles = { '': '首页', mall: '设备商城', list: '套餐列表', plan: '套餐详情', quote: '询价单', consult: '找客服报价', done: '提交成功', guide: '对公采购流程' };
    document.title = (titles[path[0] || ''] || '页面') + ' · 办公设备租赁（演示版）';
    switch (path[0]) {
      case undefined: return pageHome();
      case 'mall': return pageMall();
      case 'list': return pageList(path[1]);
      case 'plan': return pageDetail(path[1], path[2]);
      case 'quote': return pageQuote();
      case 'consult': return pageConsult(q);
      case 'done': return pageDone(q);
      case 'guide': return pageGuide();
      default: return page404();
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();
