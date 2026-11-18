/* =====================================================================
   FREZZO TV. Данные экранов и их показ.
   Позже эти списки будут приходить из формы клиента, а не из файла.
   ===================================================================== */

/* слайды экрана 1. align: где текст, по тихой зоне фото */
const SLIDES = [
  { img: '../assets/coldbrew.jpg', label: 'Kalt', title: ['Cold', 'Brew'], sub: '12 Stunden kalt extrahiert, schokoladig und mild', price: '4,20 €', align: 'right' },
  { img: '../assets/flatwhite.jpg', label: 'Kaffee', title: ['Flat', 'White'], sub: 'Doppelter Espresso und samtige Milch', price: '3,90 €', align: 'left' },
  { img: '../assets/caramel.jpg', label: 'Eis', title: ['Salted', 'Caramel'], sub: 'Hausgemachtes Eis mit warmem Karamell', price: '3,60 €', pre: '2 Kugeln', split: true },
  { img: '../assets/matcha.jpg', label: 'Matcha', title: ['Matcha', 'Latte'], sub: 'Ceremonial Grade aus Japan, auch iced', price: '4,50 €', align: 'right' },
  { img: '../assets/cones.jpg', label: 'Eis', title: ['Schoko', 'Gelato'], sub: 'In der Waffel, die wir selbst backen', price: '1,90 €', pre: '1 Kugel', split: true },
  { img: '../assets/v60.jpg', label: 'Filter', title: ['Filter', 'Kaffee'], sub: 'Specialty Bohnen, frisch per Hand gebrüht', price: '3,40 €', align: 'left' },
];
const SLIDE_MS = 8000;

/* прайс экрана 2 */
const BOARD = [
  [
    { title: 'Kaffee', items: [
      ['Espresso', '2,40'], ['Americano', '2,90'], ['Cappuccino', '3,60'], ['Flat White', '3,90'], ['Latte', '3,90'], ['Frezzo Latte', '4,60'],
    ]},
    { title: 'Kalt', items: [
      ['Iced Latte', '4,20'], ['Cold Brew', '4,20'], ['Espresso Tonic', '4,40'], ['Affogato', '4,90'],
    ]},
  ],
  [
    { title: 'Matcha & Co', items: [
      ['Matcha Latte', '4,50'], ['Iced Matcha', '4,80'], ['Kakao', '3,50'], ['Chai Latte', '4,20'],
    ]},
    { title: 'Eis', items: [
      ['1 Kugel', '1,90'], ['2 Kugeln', '3,60'], ['3 Kugeln', '5,00'], ['Eisbecher Caramel', '6,90'], ['Milkshake', '5,20'],
    ]},
  ],
];
const FLAVOURS = ['Salted Caramel', 'Pistazie', 'Mango', 'Vanille', 'Schoko', 'Erdbeere'];
const BOARD_PHOTOS = ['../assets/cones.jpg', '../assets/caramel.jpg', '../assets/coldbrew.jpg'];

/* ---------------------------------------------------------------------
   общее
   --------------------------------------------------------------------- */
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const page = document.body.dataset.page;
const framed = window.self !== window.top;

/* сцена 1920×1080 вписывается в любой экран */
function fit() {
  const st = $('#stage');
  if (!st) return;
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  st.style.transform = `scale(${k}) translate(-50%, -50%)`;
}
if (page) {
  fit();
  addEventListener('resize', fit);
  // на телевизоре: клик открывает полный экран, курсор прячется
  if (!framed) {
    document.addEventListener('click', () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); });
    let idle;
    addEventListener('pointermove', () => { document.body.classList.remove('is-idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('is-idle'), 2000); });
    // раз в 10 минут подтягиваем новые цены
    setTimeout(() => location.reload(), 10 * 60 * 1000);
  }
}

/* ---------------------------------------------------------------------
   экран 1: промо
   --------------------------------------------------------------------- */
function promo() {
  const host = $('#slides');
  const wipe = document.createElement('div');
  wipe.className = 'wipe';
  wipe.setAttribute('aria-hidden', 'true');
  // три мазка цветов Frezzo: розовый, бирюзовый, жёлтый
  wipe.innerHTML = `<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path fill="#ffd21f" d="M40 0 H250 Q262 10 254 20 Q268 32 256 46 Q270 60 258 72 Q266 86 250 100 H40 Q30 90 38 78 Q26 64 36 50 Q24 36 34 22 Q26 10 40 0Z"/><path fill="#19c6c6" d="M80 0 H290 Q302 10 294 20 Q308 32 296 46 Q310 60 298 72 Q306 86 290 100 H80 Q70 90 78 78 Q66 64 76 50 Q64 36 74 22 Q66 10 80 0Z"/><path fill="#ff2e88" d="M120 0 H330 Q342 10 334 20 Q348 32 336 46 Q350 60 338 72 Q346 86 330 100 H120 Q110 90 118 78 Q106 64 116 50 Q104 36 114 22 Q106 10 120 0Z"/><circle cx="352" cy="30" r="5" fill="#ff2e88"/><circle cx="364" cy="64" r="3" fill="#ff2e88"/></svg>`;
  $('#stage').append(wipe);

  host.innerHTML = SLIDES.map((s) => {
    let i = 0;
    const title = s.title.map((ln) => `<span class="ln">${[...ln].map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join('')}</span>`).join('');
    const cls = ['slide', s.split ? 'slide--split' : '', s.align === 'right' ? 'slide--right' : ''].join(' ');
    return `<div class="${cls}">
      <div class="slide__media">${s.video ? `<video src="${esc(s.video)}" muted loop playsinline preload="auto"></video>` : `<img src="${esc(s.img)}" alt="">`}</div>
      <div class="slide__blur"></div>
      <div class="slide__text">
        <span class="label">${esc(s.label)}</span>
        <h2 class="slide__title" aria-label="${esc(s.title.join(' '))}">${title}</h2>
        <p class="slide__sub">${esc(s.sub)}</p>
        <span class="tag">${s.pre ? `<small>${esc(s.pre)}</small>` : ''}${esc(s.price)}</span>
      </div>
    </div>`;
  }).join('');
  // style="--i" выше задаёт только индекс задержки букв, без оформления

  const slides = $$('.slide', host);
  const bars = $('#progress');
  bars.innerHTML = SLIDES.map(() => '<span><i></i></span>').join('');
  const segs = $$('span', bars);
  bars.style.setProperty('--dur', SLIDE_MS + 'ms');

  let cur = -1;
  function show(n) {
    const prev = slides[cur];
    const next = slides[n];
    const v = $('video', next); if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    segs.forEach((s, j) => { s.classList.toggle('is-done', j < n); s.classList.remove('is-now'); });
    void bars.offsetWidth;
    segs[n].classList.add('is-now');
    if (!prev || reduce) {
      slides.forEach((s) => s.classList.remove('is-on', 'is-out'));
      next.classList.add('is-on');
    } else {
      // мазок закрывает экран, под ним меняется слайд
      wipe.classList.remove('is-go'); void wipe.offsetWidth; wipe.classList.add('is-go');
      setTimeout(() => {
        prev.classList.remove('is-on');
        next.classList.add('is-on');
      }, 620);
    }
    cur = n;
  }
  show(Math.min(slides.length - 1, Number(new URLSearchParams(location.search).get('s')) || 0));
  setInterval(() => show((cur + 1) % slides.length), SLIDE_MS);
}

/* ---------------------------------------------------------------------
   экран 2: прайс
   --------------------------------------------------------------------- */
function board() {
  const RING = '<svg class="item__ring" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path d="M150 8 C60 0 6 18 10 42 C14 70 120 82 182 62 C206 52 196 18 140 10"/></svg>';
  $('#cols').innerHTML = BOARD.map((col, c) => `<div class="col">${col.map((g, gi) => `
    <section class="group rise" style="--d:${600 + (c * 2 + gi) * 100}ms">
      <h2 class="group__title">${esc(g.title)}</h2>
      ${g.items.map(([n, p]) => `<div class="item"><span class="item__name">${esc(n)}</span><span class="item__dots"></span><span class="item__price">${esc(p)}&nbsp;€${RING}</span></div>`).join('')}
    </section>`).join('')}</div>`).join('');
  // style="--d" — только задержка входа

  $('#flavours').innerHTML = `<b>Sorten heute</b>${FLAVOURS.map(esc).join(' / ')}`;

  const media = $('#media');
  media.innerHTML = BOARD_PHOTOS.map((s) => `<img src="${esc(s)}" alt="">`).join('');
  const pics = $$('img', media);
  let p = 0;
  pics[0].classList.add('is-on');
  setInterval(() => { pics[p].classList.remove('is-on'); p = (p + 1) % pics.length; pics[p].classList.add('is-on'); }, 9000);

  // цена дня: кружок перебегает по позициям
  const items = $$('.item');
  const order = [5, 7, 15, 10, 18, 3];
  let h = 0;
  const hot = () => { items.forEach((x) => x.classList.remove('is-hot')); items[order[h % order.length] % items.length].classList.add('is-hot'); h++; };
  setTimeout(hot, 1800);
  setInterval(hot, 6000);
}

/* ---------------------------------------------------------------------
   запуск
   --------------------------------------------------------------------- */
if (page === 'promo') promo();
if (page === 'board') board();
document.fonts.ready.then(() => requestAnimationFrame(() => document.body.classList.add('is-in')));
