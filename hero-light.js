/* 커스텀 2 (7주) — 첫 화면 햇빛이 마우스(손가락)를 부드럽게 따라온다.
   .ca-top--hero 에 --hx-x · --hx-y(0~1)를 넣고, 모양은 style.css '커스텀 2' 가 그린다.
   움직임 0(--my-motion) · 동작 줄이기 설정이면 따라오지 않는다. */
(function () {
  var hero = document.querySelector('.ca-top--hero');
  if (!hero) return;
  var R = document.documentElement;
  if (R.classList.contains('m0') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var x = .5, y = .4, tx = x, ty = y, running = false;
  function tick() {
    x += (tx - x) * .08; y += (ty - y) * .08;   /* 살짝 늦게 따라와 빛처럼 보이게 */
    hero.style.setProperty('--hx-x', x.toFixed(4));
    hero.style.setProperty('--hx-y', y.toFixed(4));
    if (Math.abs(tx - x) > .001 || Math.abs(ty - y) > .001) requestAnimationFrame(tick); else running = false;
  }
  function aim(cx, cy) {
    var r = hero.getBoundingClientRect();
    if (cy < r.top || cy > r.bottom) return;
    tx = (cx - r.left) / r.width; ty = (cy - r.top) / r.height;
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  addEventListener('pointermove', function (e) { aim(e.clientX, e.clientY); }, { passive: true });
  hero.addEventListener('pointerleave', function () { tx = .5; ty = .4; if (!running) { running = true; requestAnimationFrame(tick); } });
})();
