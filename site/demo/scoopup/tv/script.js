/* =====================================================================
   SCOOP UP TV. Данные экранов и их показ.
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
      ['Espresso', '2,40'], ['Americano', '2,90'], ['Cappuccino', '3,60'], ['Flat White', '3,90'], ['Latte', '3,90'], ['Salted Caramel Latte', '4,60'],
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
  wipe.innerHTML = `<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path fill="#ff3b30" d="M60 0 H300 Q318 8 306 18 Q326 30 310 44 Q330 58 312 70 Q324 84 300 100 H60 Q44 90 56 78 Q38 64 54 50 Q36 36 52 22 Q40 10 60 0Z"/><circle cx="330" cy="30" r="5" fill="#ff3b30"/><circle cx="344" cy="62" r="3" fill="#ff3b30"/><circle cx="26" cy="70" r="4" fill="#ff3b30"/></svg>`;
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
