/* 模拟「小程序码」：按 scene 文本生成固定图案（演示用，不可被微信识别）。正式版由云函数调 wxacode.getUnlimited 生成。
   前台海报（E8）和后台客服专属码 / 渠道码（E2/E3）共用。 */
(function () {
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function draw(ctx, x, y, size, text, label) {
    var cx = x + size / 2, cy = y + size / 2, r = size / 2, seed = hash(text);
    function rnd() { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; }
    ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    for (var ring = 0; ring < 9; ring++) { // 放射状码点（模仿小程序码外观）
      var rr = r * (0.42 + ring * 0.06), n = 24 + ring * 6;
      for (var k = 0; k < n; k++) {
        if (rnd() < 0.5) continue;
        var a = k / n * Math.PI * 2, len = r * 0.045;
        ctx.save(); ctx.translate(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); ctx.rotate(a);
        ctx.fillRect(-len / 2, -r * 0.012, len, r * 0.024 + (rnd() < 0.3 ? r * 0.02 : 0)); ctx.restore();
      }
    }
    [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6]].forEach(function (p) { // 三个定位眼
      var ex = cx + p[0] * r * 0.85, ey = cy + p[1] * r * 0.85;
      ctx.beginPath(); ctx.arc(ex, ey, r * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, r * 0.11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex, ey, r * 0.06, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#16A34A'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2); ctx.fill(); // 中间 Logo 位
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.round(r * 0.22) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label || '龙', cx, cy); ctx.restore();
  }
  function dataURL(text, size, label) {
    var c = document.createElement('canvas'); c.width = c.height = size || 240;
    draw(c.getContext('2d'), 0, 0, c.width, text, label); return c.toDataURL('image/png');
  }
  window.MPCODE = { draw: draw, dataURL: dataURL };
})();
