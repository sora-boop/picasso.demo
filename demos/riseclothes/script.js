(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- staggered entrances ---------- */
  document.querySelectorAll('.rise[data-d]').forEach(el => {
    el.style.setProperty('--d', reduce ? '0ms' : el.dataset.d + 'ms');
  });
  document.querySelectorAll('.item').forEach(el => {
    const col = (Number(el.dataset.i) + 3) % 4;
    el.style.setProperty('--d', reduce ? '0ms' : col * 50 + 'ms');
  });

  const hero = document.querySelector('.hero');
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('section:not(.hero) .rise').forEach(el => io.observe(el));

  /* ---------- brand filter ---------- */
  const chips = [...document.querySelectorAll('.chip')];
  const items = [...document.querySelectorAll('.item')];

  function applyFilter(key) {
    chips.forEach(c => {
      const on = c.dataset.filter === key;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', on);
    });
    items.forEach(it => {
      const show = key === 'all' || it.dataset.brand === key;
      it.classList.toggle('is-hidden', !show);
      if (show) it.classList.add('is-in');
    });
  }
  chips.forEach(c => c.addEventListener('click', () => applyFilter(c.dataset.filter)));

  /* ---------- brand index: cursor preview (signature) + jump to filtered catalog ---------- */
  const preview = document.querySelector('.index__preview');
  const rows = document.querySelectorAll('.index__row');
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;

  function loop() {
    x += (tx - x) * 0.14;
    y += (ty - y) * 0.14;
    preview.style.setProperty('--x', x + 'px');
    preview.style.setProperty('--y', y + 'px');
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
  }
  function follow(e) {
    tx = e.clientX + 24;
    ty = e.clientY - 110;
    if (!raf) raf = requestAnimationFrame(loop);
  }

  rows.forEach(row => {
    row.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      if (!preview.src.endsWith(row.dataset.preview)) preview.src = row.dataset.preview;
      if (!preview.classList.contains('is-on')) { x = tx = e.clientX + 24; y = ty = e.clientY - 110; }
      preview.classList.add('is-on');
    });
    row.addEventListener('pointermove', follow);
    row.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
    row.addEventListener('click', () => {
      preview.classList.remove('is-on');
      applyFilter(row.dataset.filter);
      document.getElementById('catalog').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // preload previews
  rows.forEach(r => { const i = new Image(); i.src = r.dataset.preview; });
})();
