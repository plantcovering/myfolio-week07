/* 커스텀 4·5 (7주) — 카드 줄: 장이 화면에 멈춘 채 아래로 스크롤한 만큼 카드 줄이 옆으로 지나간다.
   --mv-dist(옆으로 갈 거리)를 재서 멈춤 구간 길이로 쓰고, 스크롤 위치를 0~1로 바꿔 카드 줄을 옮긴다.
   data-move="all"   = 1280 · 폰 둘 다 (4장 물건)
   data-move="phone" = 폰(≤768)만 (2장 사람 — 1280 은 원래 배치 그대로)
   폰에서는 카드 줄을 옆으로 밀어도 같은 만큼 스크롤해서 넘어간다. 카드 아래 가는 선(.mv-bar)이 지금 위치를 보여 준다. */
(function () {
  var mq = matchMedia('(max-width: 768px)');
  function gnbH() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ca-gnb-h')) || 0; }

  document.querySelectorAll('.ca-sec[data-move]').forEach(function (sec) {
    var track = sec.querySelector('.mv-track'), view = sec.querySelector('.mv-view'), row = sec.querySelector('.ca-grid');
    if (!track || !view || !row) return;
    var phoneOnly = sec.getAttribute('data-move') === 'phone', dist = 0, tx = 0, ticking = false;
    var bar = document.createElement('div'); bar.className = 'mv-bar'; bar.setAttribute('aria-hidden', 'true'); view.appendChild(bar);

    function on() { return phoneOnly ? mq.matches : true; }
    function reset() { dist = 0; tx = 0; sec.style.removeProperty('--mv-dist'); sec.style.removeProperty('--shelf-dist'); row.style.transform = ''; sec.classList.remove('is-end'); }
    function measure() {
      if (!on()) { reset(); return; }
      var cards = row.querySelectorAll('.ca-card'), last = cards[cards.length - 1];
      var padR = parseFloat(getComputedStyle(row).paddingRight) || 0;
      /* 화면 좌표로 잰다: 지금 옮겨 둔 거리(tx)를 되돌린 마지막 카드 오른쪽 끝 + 오른쪽 여백 − view 오른쪽 끝 */
      dist = last ? Math.max(0, Math.ceil(last.getBoundingClientRect().right - tx + padR - view.getBoundingClientRect().right)) : 0;
      sec.style.setProperty('--mv-dist', dist + 'px');
      sec.style.setProperty('--shelf-dist', dist + 'px');   /* 1280 4장 CSS 가 쓰는 이름 */
      update();
    }
    function progress() {
      if (!dist) return 0;
      var p = (gnbH() - track.getBoundingClientRect().top) / dist;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    }
    function update() {
      ticking = false;
      if (!on()) return;
      var p = progress();
      tx = -p * dist;
      row.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,0,0)';
      sec.style.setProperty('--mv-p', p.toFixed(3));
      sec.classList.toggle('is-end', p > .98);
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', measure);
    if (mq.addEventListener) mq.addEventListener('change', measure);
    row.querySelectorAll('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', measure); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    /* 폰: 카드 줄을 옆으로 밀면 그만큼 페이지를 스크롤한다(왼쪽으로 밀기 = 다음 카드). 세로 손짓은 브라우저에 맡긴다 */
    var sx = null, sy = 0, lx = 0, horiz = null;
    view.addEventListener('touchstart', function (e) { if (!mq.matches || !dist || e.touches.length !== 1) { sx = null; return; } sx = lx = e.touches[0].clientX; sy = e.touches[0].clientY; horiz = null; }, { passive: true });
    view.addEventListener('touchmove', function (e) {
      if (sx == null) return;
      var t = e.touches[0];
      if (horiz == null) { var dx = Math.abs(t.clientX - sx), dy = Math.abs(t.clientY - sy); if (dx < 6 && dy < 6) return; horiz = dx > dy; }
      if (horiz) { window.scrollBy(0, lx - t.clientX); }
      lx = t.clientX;
    }, { passive: true });
    view.addEventListener('touchend', function () { sx = null; }, { passive: true });

    /* 키보드로 화면 밖 카드에 닿으면 그 카드가 보이는 스크롤 위치로 옮긴다 */
    row.addEventListener('focusin', function (e) {
      if (!on() || !dist) return;
      var card = e.target.closest('.ca-card'); if (!card) return;
      var vr = view.getBoundingClientRect(), cr = card.getBoundingClientRect();
      var want = Math.min(dist, Math.max(0, (cr.left - tx) - vr.left - (vr.width - cr.width) / 2));
      var top = track.getBoundingClientRect().top + scrollY - gnbH();
      window.scrollTo(0, top + want);
    });

    measure();
  });
})();
