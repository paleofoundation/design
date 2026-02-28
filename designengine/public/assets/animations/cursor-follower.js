/* Cursor Follower — dzyn generated */
(function initDzynCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var el = document.createElement('div');
  el.className = 'dzyn-cursor';
  document.body.appendChild(el);

  var x = 0, y = 0, tx = 0, ty = 0;
  var speed = 0.15;
  var halfW = 10;

  document.addEventListener('mousemove', function(e) {
    tx = e.clientX;
    ty = e.clientY;
  });

  var interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';

  document.addEventListener('mouseover', function(e) {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      el.classList.add('dzyn-cursor--hover');
      halfW = 22;
    }
  });

  document.addEventListener('mouseout', function(e) {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      el.classList.remove('dzyn-cursor--hover');
      halfW = 10;
    }
  });

  function tick() {
    x += (tx - x) * speed;
    y += (ty - y) * speed;
    el.style.transform = 'translate3d(' + (x - halfW) + 'px,' + (y - halfW) + 'px,0)';
    requestAnimationFrame(tick);
  }
  tick();
})();